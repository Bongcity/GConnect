/**
 * 자동 동기화 스케줄러
 * 
 * node-cron을 사용하여 사용자별 동기화 작업을 예약하고 실행합니다.
 */

import cron from 'node-cron';
import { prisma } from '@gconnect/db';
import { NaverApiClient, transformNaverProduct } from './naver-api';
import { triggerWebhooks, WebhookPayload } from './webhook';

// 실행 중인 크론 작업들을 저장
const cronJobs = new Map<string, cron.ScheduledTask>();

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
      // API 미설정 시 샘플 데이터 동기화
      console.log('⚠️ 네이버 API 미설정 - 샘플 데이터 사용');
      return { total: 0, synced: 0, failed: 0 };
    }

    // 네이버 API 클라이언트 생성
    const naverClient = new NaverApiClient({
      clientId: user.naverClientId,
      clientSecret: user.naverClientSecret,
    });

    // 네이버에서 모든 상품 조회
    const naverProducts = await naverClient.getAllProducts();
    total = naverProducts.length;

    // 각 상품을 DB에 저장/업데이트
    for (const naverProduct of naverProducts) {
      try {
        const productData = transformNaverProduct(naverProduct);

        // 기존 상품 확인
        const existingProduct = await prisma.product.findFirst({
          where: {
            userId,
            naverProductId: productData.naverProductId,
          },
        });

        if (existingProduct) {
          // 업데이트
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              ...productData,
              lastSyncedAt: new Date(),
              syncStatus: 'SYNCED',
              syncError: null,
            },
          });
        } else {
          // 생성
          await prisma.product.create({
            data: {
              userId,
              ...productData,
              lastSyncedAt: new Date(),
              syncStatus: 'SYNCED',
            },
          });
        }

        synced++;
      } catch (error) {
        console.error('상품 동기화 오류:', error);
        failed++;
      }
    }
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
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
 * 모든 크론 작업 중지
 */
export function stopAllCronJobs() {
  console.log('⏹️ 모든 크론 작업 중지 중...');
  cronJobs.forEach((task, userId) => {
    task.stop();
    console.log(`  ⏹️ ${userId}`);
  });
  cronJobs.clear();
  console.log('✅ 모든 크론 작업 중지 완료');
}

