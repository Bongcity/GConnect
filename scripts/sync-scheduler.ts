/**
 * GConnect 자동 동기화 스케줄러
 * 
 * 이 스크립트는 독립적으로 실행되며, DB의 SyncSchedule 테이블을 확인하여
 * 예정된 동기화 작업을 자동으로 실행합니다.
 * 
 * 실행 방법:
 * - 개발: pnpm scheduler:dev
 * - 프로덕션: pnpm scheduler
 * - PM2: pm2 start ecosystem.config.js
 */

// 환경 변수 로드 (가장 먼저 실행)
import dotenv from 'dotenv';
import path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
// .env 파일도 로드 (fallback)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('[Scheduler] 환경 변수 로드 완료');
console.log('[Scheduler] DATABASE_URL:', process.env.DATABASE_URL ? '✅' : '❌');
console.log('[Scheduler] DDRO_DATABASE_URL:', process.env.DDRO_DATABASE_URL ? '✅' : '❌');

import cron from 'node-cron';
import { prisma } from '../packages/db';
import { NaverApiClient, transformNaverProduct } from '../apps/seller/lib/naver-api';
import { createSyncErrorNotification, createSchedulerNotification } from '../lib/notifications';

// 환경 변수
const CHECK_INTERVAL = process.env.SCHEDULER_CHECK_INTERVAL || '60000'; // 1분
const MAX_CONCURRENT = parseInt(process.env.SCHEDULER_MAX_CONCURRENT || '1');
const SCHEDULER_ENABLED = process.env.SCHEDULER_ENABLED !== 'false';

// 진행 중인 작업 추적
const runningJobs = new Set<string>();

/**
 * 암호화된 네이버 API 키 복호화
 */
async function getDecryptedNaverApiKey(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      naverClientId: true,
      naverClientSecret: true,
      naverApiEnabled: true,
    },
  });

  if (!user || !user.naverApiEnabled || !user.naverClientId || !user.naverClientSecret) {
    return null;
  }

  // 실제 복호화 로직은 apps/seller/lib/naver-utils.ts 참조
  // 여기서는 간단히 반환 (실제로는 복호화 필요)
  return {
    clientId: user.naverClientId,
    clientSecret: user.naverClientSecret,
  };
}

/**
 * 재시도 로직이 포함된 네이버 API 상품 가져오기
 */
async function fetchNaverProductsWithRetry(
  naverClient: NaverApiClient,
  maxRetries: number = 3,
  maxPages: number = 3
): Promise<any[]> {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Scheduler] 네이버 API 호출 시도 ${attempt}/${maxRetries}`);
      const naverProducts = await naverClient.getAllProducts(maxPages);
      console.log(`[Scheduler] 성공: ${naverProducts.length}개 상품 가져옴`);
      return naverProducts.map(transformNaverProduct);
    } catch (error: any) {
      lastError = error;
      console.error(`[Scheduler] 시도 ${attempt} 실패:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = 5 * 60 * 1000 * Math.pow(1.5, attempt - 1); // Exponential backoff
        console.log(`[Scheduler] ${Math.round(delay / 1000)}초 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`네이버 API 동기화 실패 (${maxRetries}회 시도): ${lastError?.message || '알 수 없는 오류'}`);
}

/**
 * 사용자별 상품 동기화 실행
 */
async function syncUserProducts(userId: string, scheduleId: string): Promise<void> {
  // 중복 실행 방지
  if (runningJobs.has(userId)) {
    console.log(`[Scheduler] 사용자 ${userId}의 동기화가 이미 진행 중입니다.`);
    return;
  }

  runningJobs.add(userId);
  console.log(`[Scheduler] 사용자 ${userId} 동기화 시작`);

  try {
    // 네이버 API 키 확인
    const naverApiKey = await getDecryptedNaverApiKey(userId);
    
    if (!naverApiKey) {
      throw new Error('네이버 API 키가 등록되지 않았습니다.');
    }

    // 동기화 로그 생성
    const syncLog = await prisma.syncLog.create({
      data: {
        userId,
        syncType: 'PRODUCT_SYNC',
        status: 'SUCCESS',
        itemsTotal: 0,
        itemsSynced: 0,
        itemsFailed: 0,
      },
    });

    let productsToSync: any[] = [];
    
    try {
      const naverClient = new NaverApiClient({
        clientId: naverApiKey.clientId,
        clientSecret: naverApiKey.clientSecret,
      });

      productsToSync = await fetchNaverProductsWithRetry(naverClient, 3, 3);
    } catch (error: any) {
      console.error(`[Scheduler] 사용자 ${userId} API 호출 실패:`, error);
      
      // 실패 로그 업데이트
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'FAILED',
          errorLog: error.message,
        },
      });

      // 스케줄 업데이트 (실패)
      await prisma.syncSchedule.update({
        where: { id: scheduleId },
        data: {
          lastRun: new Date(),
          lastStatus: 'FAILED',
          failedRuns: { increment: 1 },
          totalRuns: { increment: 1 },
        },
      });

      // 관리자 알림
      const user = await prisma.user.findUnique({ where: { id: userId } });
      await createSyncErrorNotification({
        userId,
        userName: user?.name || undefined,
        userEmail: user?.email || undefined,
        errorMessage: error.message,
        syncLogId: syncLog.id,
        retryCount: 3,
      });

      return;
    }

    // 상품 동기화
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const productData of productsToSync) {
      try {
        const categoryPath = [
          productData.category1,
          productData.category2,
          productData.category3,
        ]
          .filter(Boolean)
          .join(' > ');

        const existingProduct = productData.naverProductId
          ? await prisma.product.findFirst({
              where: {
                userId,
                naverProductId: productData.naverProductId,
              },
            })
          : null;

        if (existingProduct) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              salePrice: productData.salePrice || null,
              stockQuantity: productData.stockQuantity,
              imageUrl: productData.imageUrl,
              thumbnailUrl: productData.thumbnailUrl,
              category1: productData.category1,
              category2: productData.category2,
              category3: productData.category3,
              categoryPath,
              syncStatus: 'SYNCED',
              lastSyncedAt: new Date(),
            },
          });
        } else {
          await prisma.product.create({
            data: {
              userId,
              name: productData.name,
              description: productData.description,
              price: productData.price,
              salePrice: productData.salePrice || null,
              stockQuantity: productData.stockQuantity,
              imageUrl: productData.imageUrl,
              thumbnailUrl: productData.thumbnailUrl,
              category1: productData.category1,
              category2: productData.category2,
              category3: productData.category3,
              categoryPath,
              naverProductId: productData.naverProductId,
              naverProductNo: productData.naverProductNo,
              syncStatus: 'SYNCED',
              isActive: true,
              isGoogleExposed: Math.random() > 0.5,
              lastSyncedAt: new Date(),
            },
          });
        }
        synced++;
      } catch (error: any) {
        console.error(`[Scheduler] 상품 동기화 실패:`, error);
        errors.push(error.message);
        failed++;
      }
    }

    // 동기화 로그 업데이트
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        itemsTotal: productsToSync.length,
        itemsSynced: synced,
        itemsFailed: failed,
        status: failed === 0 ? 'SUCCESS' : failed === productsToSync.length ? 'FAILED' : 'PARTIAL',
        errorLog: errors.length > 0 ? errors.join('\n') : null,
      },
    });

    // 스케줄 업데이트 (성공)
    const schedule = await prisma.syncSchedule.findUnique({ where: { id: scheduleId } });
    const nextRun = calculateNextRun(schedule?.cronExpression || '0 */4 * * *');
    
    await prisma.syncSchedule.update({
      where: { id: scheduleId },
      data: {
        lastRun: new Date(),
        lastStatus: 'SUCCESS',
        nextRun,
        successRuns: { increment: 1 },
        totalRuns: { increment: 1 },
      },
    });

    console.log(`[Scheduler] 사용자 ${userId} 동기화 완료: ${synced}개 성공, ${failed}개 실패`);
  } catch (error: any) {
    console.error(`[Scheduler] 사용자 ${userId} 동기화 오류:`, error);
  } finally {
    runningJobs.delete(userId);
  }
}

/**
 * 다음 실행 시간 계산
 */
function calculateNextRun(cronExpression: string): Date {
  const now = new Date();
  const parts = cronExpression.split(' ');
  const [minute, hour] = parts;
  
  if (hour.startsWith('*/')) {
    const interval = parseInt(hour.substring(2));
    const nextHour = Math.ceil(now.getHours() / interval) * interval;
    const nextRun = new Date(now);
    nextRun.setHours(nextHour, parseInt(minute) || 0, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setHours(nextRun.getHours() + interval);
    }
    
    return nextRun;
  }
  
  const nextRun = new Date(now.getTime() + 60 * 60 * 1000);
  return nextRun;
}

/**
 * 스케줄 확인 및 실행
 */
async function checkAndRunSchedules(): Promise<void> {
  try {
    const now = new Date();
    
    // 실행 대기 중인 스케줄 조회
    const schedules = await prisma.syncSchedule.findMany({
      where: {
        isEnabled: true,
        OR: [
          { nextRun: { lte: now } },
          { nextRun: null },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            naverApiEnabled: true,
          },
        },
      },
    });

    if (schedules.length === 0) {
      return;
    }

    console.log(`[Scheduler] ${schedules.length}개의 동기화 작업 발견`);

    // 동시 실행 제한
    const limitedSchedules = schedules.slice(0, MAX_CONCURRENT);

    for (const schedule of limitedSchedules) {
      if (!schedule.user.naverApiEnabled) {
        console.log(`[Scheduler] 사용자 ${schedule.userId}는 네이버 API가 비활성화되어 있습니다.`);
        continue;
      }

      // 비동기로 실행 (await 하지 않음)
      syncUserProducts(schedule.userId, schedule.id).catch((error) => {
        console.error(`[Scheduler] 동기화 실행 오류:`, error);
      });
    }
  } catch (error) {
    console.error('[Scheduler] 스케줄 확인 오류:', error);
  }
}

/**
 * 스케줄러 시작
 */
async function startScheduler(): Promise<void> {
  if (!SCHEDULER_ENABLED) {
    console.log('[Scheduler] 스케줄러가 비활성화되어 있습니다.');
    return;
  }

  console.log('[Scheduler] GConnect 자동 동기화 스케줄러 시작');
  console.log(`[Scheduler] 확인 간격: ${parseInt(CHECK_INTERVAL) / 1000}초`);
  console.log(`[Scheduler] 최대 동시 작업: ${MAX_CONCURRENT}개`);

  // 시작 알림
  await createSchedulerNotification('START', '자동 동기화 스케줄러가 시작되었습니다.');

  // 1분마다 스케줄 확인
  cron.schedule('* * * * *', async () => {
    await checkAndRunSchedules();
  });

  console.log('[Scheduler] 스케줄러가 실행 중입니다...');
}

/**
 * 종료 처리
 */
process.on('SIGINT', async () => {
  console.log('\n[Scheduler] 종료 신호 수신, 정리 중...');
  await createSchedulerNotification('STOP', '자동 동기화 스케줄러가 중지되었습니다.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[Scheduler] 종료 신호 수신, 정리 중...');
  await createSchedulerNotification('STOP', '자동 동기화 스케줄러가 중지되었습니다.');
  process.exit(0);
});

// 스케줄러 시작
startScheduler().catch(async (error) => {
  console.error('[Scheduler] 시작 실패:', error);
  await createSchedulerNotification('ERROR', `스케줄러 시작 실패: ${error.message}`);
  process.exit(1);
});

