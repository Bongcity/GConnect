/**
 * 자동 동기화 스케줄러
 * 
 * node-cron을 사용하여 사용자별 동기화 작업을 예약하고 실행합니다.
 */

import cron from 'node-cron';
import { prisma } from '@gconnect/db';
import { NaverApiClient, transformNaverProduct } from './naver-api';
import { triggerWebhooks, WebhookPayload } from './webhook';
import { getGSCClient } from './google-search-console';

// 실행 중인 크론 작업들을 저장
const cronJobs = new Map<string, cron.ScheduledTask>();

// GSC 동기화 크론 작업
let gscSyncCronJob: cron.ScheduledTask | null = null;

/**
 * 스케줄러 초기화
 * 모든 활성화된 스케줄을 로드하고 크론 작업 등록
 */
export async function initScheduler() {
  console.log('🔄 스케줄러 초기화 중...');
  
  try {
    // 활성화된 모든 스케줄 조회
    const schedules = await prisma.syncSchedule.findMany({
      where: {
        isEnabled: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            shopName: true,
            naverClientId: true,
            naverClientSecret: true,
            naverApiEnabled: true,
          },
        },
      },
    });

    console.log(`📋 활성화된 스케줄 ${schedules.length}개 발견`);

    // 각 스케줄에 대해 크론 작업 등록
    for (const schedule of schedules) {
      await registerCronJob(schedule);
    }

    console.log('✅ 스케줄러 초기화 완료');
    
    // Google Search Console 데이터 동기화 크론 작업 등록 (1시간마다)
    await registerGSCSync();
  } catch (error) {
    console.error('❌ 스케줄러 초기화 실패:', error);
  }
}

/**
 * 크론 작업 등록
 */
export async function registerCronJob(schedule: any) {
  const { id, userId, cronExpression, timezone } = schedule;

  // 이미 등록된 작업이 있으면 중지
  if (cronJobs.has(userId)) {
    cronJobs.get(userId)?.stop();
    cronJobs.delete(userId);
  }

  try {
    // 크론 표현식 유효성 검사
    if (!cron.validate(cronExpression)) {
      console.error(`❌ 잘못된 cron 표현식: ${cronExpression}`);
      return;
    }

    // 크론 작업 생성
    const task = cron.schedule(
      cronExpression,
      async () => {
        console.log(`🚀 자동 동기화 시작 - 사용자: ${userId}`);
        await executeSyncJob(userId);
      },
      {
        scheduled: true,
        timezone: timezone || 'Asia/Seoul',
      }
    );

    cronJobs.set(userId, task);
    console.log(`✅ 크론 작업 등록 완료 - 사용자: ${userId}, 표현식: ${cronExpression}`);

    // 다음 실행 시간 계산 및 업데이트
    await updateNextRunTime(id, cronExpression, timezone);
  } catch (error) {
    console.error(`❌ 크론 작업 등록 실패 - 사용자: ${userId}`, error);
  }
}

/**
 * 크론 작업 중지
 */
export function stopCronJob(userId: string) {
  if (cronJobs.has(userId)) {
    cronJobs.get(userId)?.stop();
    cronJobs.delete(userId);
    console.log(`⏹️ 크론 작업 중지 - 사용자: ${userId}`);
  }
}

/**
 * 동기화 작업 실행
 */
export async function executeSyncJob(userId: string) {
  const startTime = Date.now();
  let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
  let errorLog: string | null = null;
  let itemsTotal = 0;
  let itemsSynced = 0;
  let itemsFailed = 0;

  try {
    // 스케줄 정보 조회
    const schedule = await prisma.syncSchedule.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            naverClientId: true,
            naverClientSecret: true,
            naverApiEnabled: true,
            email: true,
            shopName: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new Error('스케줄을 찾을 수 없습니다.');
    }

    // 상품 동기화
    if (schedule.syncProducts) {
      const syncResult = await syncProducts(userId, schedule.user);
      itemsTotal = syncResult.total;
      itemsSynced = syncResult.synced;
      itemsFailed = syncResult.failed;

      if (syncResult.failed > 0) {
        status = 'FAILED';
        errorLog = `${syncResult.failed}개 상품 동기화 실패`;
      }
    }

    // 동기화 로그 저장
    await prisma.syncLog.create({
      data: {
        userId,
        syncType: 'AUTO_SYNC',
        status,
        itemsTotal,
        itemsSynced,
        itemsFailed,
        errorLog,
      },
    });

    // 스케줄 통계 업데이트
    await prisma.syncSchedule.update({
      where: { id: schedule.id },
      data: {
        lastRun: new Date(),
        lastStatus: status,
        totalRuns: { increment: 1 },
        successRuns: status === 'SUCCESS' ? { increment: 1 } : undefined,
        failedRuns: status === 'FAILED' ? { increment: 1 } : undefined,
      },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ 동기화 완료 - 사용자: ${userId}, 상태: ${status}, 소요시간: ${duration}ms`);

    // 알림 전송
    if (
      (status === 'SUCCESS' && schedule.notifyOnSuccess) ||
      (status === 'FAILED' && schedule.notifyOnError)
    ) {
      await sendNotification(schedule, status, {
        itemsTotal,
        itemsSynced,
        itemsFailed,
        duration,
      });
    }

    // 웹훅 트리거
    const webhookPayload: WebhookPayload = {
      event: status === 'SUCCESS' ? 'sync.success' : 'sync.error',
      timestamp: new Date().toISOString(),
      data: {
        userId,
        shopName: schedule.user.shopName || undefined,
        status,
        itemsTotal,
        itemsSynced,
        itemsFailed,
        duration,
      },
    };
    await triggerWebhooks(userId, webhookPayload);
  } catch (error: any) {
    status = 'FAILED';
    errorLog = error.message;
    console.error(`❌ 동기화 실패 - 사용자: ${userId}`, error);

    // 실패 로그 저장
    await prisma.syncLog.create({
      data: {
        userId,
        syncType: 'AUTO_SYNC',
        status: 'FAILED',
        itemsTotal,
        itemsSynced,
        itemsFailed,
        errorLog,
      },
    });

    // 스케줄 통계 업데이트
    const schedule = await prisma.syncSchedule.findUnique({ 
      where: { userId },
      include: {
        user: {
          select: {
            shopName: true,
          },
        },
      },
    });
    if (schedule) {
      await prisma.syncSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRun: new Date(),
          lastStatus: 'FAILED',
          totalRuns: { increment: 1 },
          failedRuns: { increment: 1 },
        },
      });

      // 오류 알림
      if (schedule.notifyOnError) {
        await sendNotification(schedule, 'FAILED', {
          error: errorLog,
        });
      }

      // 웹훅 트리거
      const webhookPayload: WebhookPayload = {
        event: 'sync.error',
        timestamp: new Date().toISOString(),
        data: {
          userId,
          shopName: schedule.user?.shopName || undefined,
          status: 'FAILED',
          itemsTotal,
          itemsSynced,
          itemsFailed,
          error: errorLog || undefined,
        },
      };
      await triggerWebhooks(userId, webhookPayload);
    }
  }
}

/**
 * 상품 동기화
 */
async function syncProducts(userId: string, user: any) {
  let total = 0;
  let synced = 0;
  let failed = 0;

  try {
    // 네이버 API가 활성화되어 있는지 확인
    if (!user.naverApiEnabled || !user.naverClientId || !user.naverClientSecret) {
      console.log('⚠️ 네이버 API 미설정 - 동기화 건너뛰기');
      throw new Error('네이버 API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 등록해주세요.');
    }

    // 암호화된 Client Secret 복호화
    const { decrypt } = await import('./crypto');
    let decryptedSecret: string;
    
    try {
      decryptedSecret = decrypt(user.naverClientSecret);
      if (!decryptedSecret) {
        throw new Error('Client Secret 복호화 실패');
      }
      console.log(`✅ Client Secret 복호화 성공 (길이: ${decryptedSecret.length})`);
    } catch (decryptError) {
      console.error('❌ Client Secret 복호화 오류:', decryptError);
      throw new Error('네이버 API 키 복호화에 실패했습니다. 설정을 다시 저장해주세요.');
    }

    // 네이버 API 클라이언트 생성
    const naverClient = new NaverApiClient({
      clientId: user.naverClientId,
      clientSecret: decryptedSecret,
    });

    // 스토어 ID 조회 (URL 생성용)
    console.log('🏪 스토어 ID 조회 중...');
    const storeId = await naverClient.getStoreId();
    console.log(`✅ 스토어 ID: ${storeId}`);

    // 네이버에서 모든 상품 조회
    console.log('📦 네이버 상품 목록 조회 중...');
    const naverProducts = await naverClient.getAllProducts();
    total = naverProducts.length;
    console.log(`📊 조회된 상품 수: ${total}개`);

    if (total === 0) {
      console.log('⚠️ 조회된 상품이 없습니다.');
      return { total: 0, synced: 0, failed: 0 };
    }

    // 각 상품을 DB에 저장/업데이트 (상세 정보 포함)
    const BATCH_SIZE = 5;
    for (let i = 0; i < naverProducts.length; i += BATCH_SIZE) {
      const batch = naverProducts.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async (naverProduct) => {
          try {
            // 상세 정보 조회
            const channelProductNo = naverProduct.channelProducts?.[0]?.channelProductNo;
            let detailData = null;
            
            if (channelProductNo) {
              try {
                detailData = await naverClient.getChannelProductDetail(channelProductNo.toString());
              } catch (detailError) {
                console.warn(`⚠️ 상품 상세 조회 실패 (channelProductNo: ${channelProductNo}):`, detailError);
              }
            }

            // 상품 데이터 변환 (storeId와 detailData 전달)
            const productData = transformNaverProduct(naverProduct, detailData, storeId);

            // 필수 데이터 검증
            if (!productData.name || productData.name === '상품명 없음' || !productData.naverProductId) {
              console.warn('⚠️ 상품 데이터 불충분, 스킵:', { 
                name: productData.name, 
                id: productData.naverProductId 
              });
              failed++;
              return;
            }

            // 기존 상품 확인
            const existingProduct = await prisma.product.findFirst({
              where: {
                userId,
                product_name: productData.name,
              },
            });

            if (existingProduct) {
              // 업데이트
              await prisma.product.update({
                where: { id: existingProduct.id },
                data: {
                  product_name: productData.name,
                  sale_price: productData.price ? BigInt(productData.price) : null,
                  discounted_sale_price: productData.salePrice ? BigInt(productData.salePrice) : null,
                  discounted_rate: productData.discountedRate || null,
                  representative_product_image_url: productData.imageUrl || null,
                  product_url: productData.productUrl || null,
                  
                  // 스토어 정보
                  affiliate_store_id: productData.storeId ? BigInt(productData.storeId) : null,
                  store_name: productData.storeName || null,
                  brand_store: productData.brandStore ? true : false,
                  
                  // 수수료 정보
                  commission_rate: productData.commissionRate || null,
                  promotion_commission_rate: productData.promotionCommissionRate || null,
                  
                  // 추가 이미지 (JSON 문자열)
                  other_product_image_urls: productData.otherImageUrls && productData.otherImageUrls.length > 0
                    ? JSON.stringify(productData.otherImageUrls)
                    : null,
                  
                  // 상세 URL 및 프로모션
                  product_description_url: productData.descriptionUrl || null,
                  promotion_json: productData.promotionJson || null,
                  
                  enabled: true,
                  updated_at: new Date(),
                },
              });
              console.log(`✅ 상품 업데이트: ${productData.name}`);
            } else {
              // 생성
              await prisma.product.create({
                data: {
                  userId,
                  product_name: productData.name,
                  sale_price: productData.price ? BigInt(productData.price) : null,
                  discounted_sale_price: productData.salePrice ? BigInt(productData.salePrice) : null,
                  discounted_rate: productData.discountedRate || null,
                  representative_product_image_url: productData.imageUrl || null,
                  product_url: productData.productUrl || null,
                  product_status: 'ON_SALE',
                  
                  // 스토어 정보
                  affiliate_store_id: productData.storeId ? BigInt(productData.storeId) : null,
                  store_name: productData.storeName || null,
                  brand_store: productData.brandStore ? true : false,
                  
                  // 수수료 정보
                  commission_rate: productData.commissionRate || null,
                  promotion_commission_rate: productData.promotionCommissionRate || null,
                  
                  // 추가 이미지 (JSON 문자열)
                  other_product_image_urls: productData.otherImageUrls && productData.otherImageUrls.length > 0
                    ? JSON.stringify(productData.otherImageUrls)
                    : null,
                  
                  // 상세 URL 및 프로모션
                  product_description_url: productData.descriptionUrl || null,
                  promotion_json: productData.promotionJson || null,
                  
                  enabled: true,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              });
              console.log(`✅ 상품 생성: ${productData.name}`);
            }

            synced++;
          } catch (error: any) {
            console.error('❌ 상품 동기화 오류:', error.message);
            failed++;
          }
        })
      );

      console.log(`📊 진행 상황: ${Math.min(i + BATCH_SIZE, total)}/${total}`);
    }

    console.log(`✅ 동기화 완료 - 총: ${total}, 성공: ${synced}, 실패: ${failed}`);
  } catch (error: any) {
    console.error('❌ 상품 목록 조회 오류:', error.message);
    throw error;
  }

  return { total, synced, failed };
}

/**
 * 다음 실행 시간 계산
 */
async function updateNextRunTime(scheduleId: string, _cronExpression: string, _timezone: string) {
  try {
    // 간단한 계산: 현재 시간 기준으로 다음 실행 시간 추정
    // 실제로는 cron-parser 라이브러리 사용 권장
    const now = new Date();
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 기본 24시간 후

    await prisma.syncSchedule.update({
      where: { id: scheduleId },
      data: { nextRun },
    });
  } catch (error) {
    console.error('다음 실행 시간 업데이트 실패:', error);
  }
}

/**
 * 알림 전송
 */
async function sendNotification(schedule: any, status: string, details: any) {
  try {
    console.log(`📧 알림 전송 - 사용자: ${schedule.userId}, 상태: ${status}`);
    
    if (!schedule.notifyEmail) {
      console.log('⚠️ 알림 이메일이 설정되지 않았습니다.');
      return;
    }
    
    const { sendEmail, generateSyncSuccessEmail, generateSyncErrorEmail } = await import('./email');
    
    const subject = status === 'SUCCESS' 
      ? '[GConnect] 자동 동기화 완료 ✅'
      : '[GConnect] 자동 동기화 실패 ⚠️';
    
    const html = status === 'SUCCESS'
      ? generateSyncSuccessEmail({
          shopName: schedule.user?.shopName,
          itemsTotal: details.itemsTotal || 0,
          itemsSynced: details.itemsSynced || 0,
          itemsFailed: details.itemsFailed || 0,
          duration: details.duration || 0,
        })
      : generateSyncErrorEmail({
          shopName: schedule.user?.shopName,
          itemsTotal: details.itemsTotal,
          itemsSynced: details.itemsSynced,
          itemsFailed: details.itemsFailed,
          error: details.error,
        });
    
    await sendEmail({
      to: schedule.notifyEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('알림 전송 실패:', error);
  }
}

/**
 * Google Search Console 데이터 동기화 크론 작업 등록
 * 매 시간 정각(0분)에 실행
 */
export async function registerGSCSync() {
  console.log('[GSC Sync] 크론 작업 등록 중...');
  
  const gscClient = getGSCClient();
  
  if (!gscClient.isEnabled()) {
    console.log('[GSC Sync] ⚠️ GSC API 비활성화 - 크론 작업 건너뜀');
    return;
  }
  
  // 기존 작업이 있으면 중지
  if (gscSyncCronJob) {
    gscSyncCronJob.stop();
  }
  
  // 매 시간 정각에 실행 (예: 0:00, 1:00, 2:00...)
  gscSyncCronJob = cron.schedule('0 * * * *', async () => {
    console.log('[GSC Sync] ⏰ 크론 작업 시작');
    
    try {
      // 최근 7일 데이터 동기화
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      await gscClient.syncProductStats({ start: startDate, end: endDate });
      
      console.log('[GSC Sync] ✅ 크론 작업 완료');
    } catch (error) {
      console.error('[GSC Sync] ❌ 크론 작업 실패:', error);
    }
  });
  
  console.log('[GSC Sync] ✅ 크론 작업 등록 완료 (매 시간 정각 실행)');
  
  // 초기 동기화 실행 (선택사항 - 스케줄러 시작 시 즉시 실행)
  console.log('[GSC Sync] 🚀 초기 동기화 시작...');
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    await gscClient.syncProductStats({ start: startDate, end: endDate });
    console.log('[GSC Sync] ✅ 초기 동기화 완료');
  } catch (error) {
    console.error('[GSC Sync] ❌ 초기 동기화 실패:', error);
  }
}

/**
 * 모든 크론 작업 중지
 */
export function stopAllCronJobs() {
  console.log('⏹️ 모든 크론 작업 중지 중...');
  cronJobs.forEach((task, userId) => {
    task.stop();
    console.log(`  ⏹️ ${userId}`);
  });
  cronJobs.clear();
  
  // GSC 동기화 크론 작업도 중지
  if (gscSyncCronJob) {
    gscSyncCronJob.stop();
    console.log('  ⏹️ GSC Sync');
  }
  
  console.log('✅ 모든 크론 작업 중지 완료');
}

