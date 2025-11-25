/**
 * ?먮룞 ?숆린???ㅼ?以꾨윭
 * 
 * node-cron???ъ슜?섏뿬 ?ъ슜?먮퀎 ?숆린???묒뾽???덉빟?섍퀬 ?ㅽ뻾?⑸땲??
 */

import cron from 'node-cron';
import { prisma } from '@gconnect/db';
import NaverApiClient from './naver-api';
import { triggerWebhooks, WebhookPayload } from './webhook';

// ?ㅽ뻾 以묒씤 ?щ줎 ?묒뾽?ㅼ쓣 ???
const cronJobs = new Map<string, cron.ScheduledTask>();

/**
 * ?ㅼ?以꾨윭 珥덇린??
 * 紐⑤뱺 ?쒖꽦?붾맂 ?ㅼ?以꾩쓣 濡쒕뱶?섍퀬 ?щ줎 ?묒뾽 ?깅줉
 */
export async function initScheduler() {
  console.log('?봽 ?ㅼ?以꾨윭 珥덇린??以?..');
  
  try {
    // ?쒖꽦?붾맂 紐⑤뱺 ?ㅼ?以?議고쉶
    const schedules = await db.syncSchedule.findMany({
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

    console.log(`?뱥 ?쒖꽦?붾맂 ?ㅼ?以?${schedules.length}媛?諛쒓껄`);

    // 媛??ㅼ?以꾩뿉 ????щ줎 ?묒뾽 ?깅줉
    for (const schedule of schedules) {
      await registerCronJob(schedule);
    }

    console.log('???ㅼ?以꾨윭 珥덇린???꾨즺');
  } catch (error) {
    console.error('???ㅼ?以꾨윭 珥덇린???ㅽ뙣:', error);
  }
}

/**
 * ?щ줎 ?묒뾽 ?깅줉
 */
export async function registerCronJob(schedule: any) {
  const { id, userId, cronExpression, timezone } = schedule;

  // ?대? ?깅줉???묒뾽???덉쑝硫?以묒?
  if (cronJobs.has(userId)) {
    cronJobs.get(userId)?.stop();
    cronJobs.delete(userId);
  }

  try {
    // ?щ줎 ?쒗쁽???좏슚??寃??
    if (!cron.validate(cronExpression)) {
      console.error(`???섎せ??cron ?쒗쁽?? ${cronExpression}`);
      return;
    }

    // ?щ줎 ?묒뾽 ?앹꽦
    const task = cron.schedule(
      cronExpression,
      async () => {
        console.log(`?? ?먮룞 ?숆린???쒖옉 - ?ъ슜?? ${userId}`);
        await executeSyncJob(userId);
      },
      {
        scheduled: true,
        timezone: timezone || 'Asia/Seoul',
      }
    );

    cronJobs.set(userId, task);
    console.log(`???щ줎 ?묒뾽 ?깅줉 ?꾨즺 - ?ъ슜?? ${userId}, ?쒗쁽?? ${cronExpression}`);

    // ?ㅼ쓬 ?ㅽ뻾 ?쒓컙 怨꾩궛 諛??낅뜲?댄듃
    await updateNextRunTime(id, cronExpression, timezone);
  } catch (error) {
    console.error(`???щ줎 ?묒뾽 ?깅줉 ?ㅽ뙣 - ?ъ슜?? ${userId}`, error);
  }
}

/**
 * ?щ줎 ?묒뾽 以묒?
 */
export function stopCronJob(userId: string) {
  if (cronJobs.has(userId)) {
    cronJobs.get(userId)?.stop();
    cronJobs.delete(userId);
    console.log(`?뱄툘 ?щ줎 ?묒뾽 以묒? - ?ъ슜?? ${userId}`);
  }
}

/**
 * ?숆린???묒뾽 ?ㅽ뻾
 */
export async function executeSyncJob(userId: string) {
  const startTime = Date.now();
  let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
  let errorLog: string | null = null;
  let itemsTotal = 0;
  let itemsSynced = 0;
  let itemsFailed = 0;

  try {
    // ?ㅼ?以??뺣낫 議고쉶
    const schedule = await db.syncSchedule.findUnique({
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
      throw new Error('?ㅼ?以꾩쓣 李얠쓣 ???놁뒿?덈떎.');
    }

    // ?곹뭹 ?숆린??
    if (schedule.syncProducts) {
      const syncResult = await syncProducts(userId, schedule.user);
      itemsTotal = syncResult.total;
      itemsSynced = syncResult.synced;
      itemsFailed = syncResult.failed;

      if (syncResult.failed > 0) {
        status = 'FAILED';
        errorLog = `${syncResult.failed}媛??곹뭹 ?숆린???ㅽ뙣`;
      }
    }

    // ?숆린??濡쒓렇 ???
    await db.syncLog.create({
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

    // ?ㅼ?以??듦퀎 ?낅뜲?댄듃
    await db.syncSchedule.update({
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
    console.log(`???숆린???꾨즺 - ?ъ슜?? ${userId}, ?곹깭: ${status}, ?뚯슂?쒓컙: ${duration}ms`);

    // ?뚮┝ ?꾩넚
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

    // ?뱁썒 ?몃━嫄?
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
    console.error(`???숆린???ㅽ뙣 - ?ъ슜?? ${userId}`, error);

    // ?ㅽ뙣 濡쒓렇 ???
    await db.syncLog.create({
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

    // ?ㅼ?以??듦퀎 ?낅뜲?댄듃
    const schedule = await db.syncSchedule.findUnique({ 
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
      await db.syncSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRun: new Date(),
          lastStatus: 'FAILED',
          totalRuns: { increment: 1 },
          failedRuns: { increment: 1 },
        },
      });

      // ?ㅻ쪟 ?뚮┝
      if (schedule.notifyOnError) {
        await sendNotification(schedule, 'FAILED', {
          error: errorLog,
        });
      }

      // ?뱁썒 ?몃━嫄?
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
 * ?곹뭹 ?숆린??
 */
async function syncProducts(userId: string, user: any) {
  let total = 0;
  let synced = 0;
  let failed = 0;

  try {
    // ?ㅼ씠踰?API媛 ?쒖꽦?붾릺???덈뒗吏 ?뺤씤
    if (!user.naverApiEnabled || !user.naverClientId || !user.naverClientSecret) {
      // API 誘몄꽕?????섑뵆 ?곗씠???숆린??
      console.log('?좑툘 ?ㅼ씠踰?API 誘몄꽕??- ?섑뵆 ?곗씠???ъ슜');
      return { total: 0, synced: 0, failed: 0 };
    }

    // ?ㅼ씠踰?API ?대씪?댁뼵???앹꽦
    const naverClient = new NaverApiClient(user.naverClientId, user.naverClientSecret);

    // ?ㅼ씠踰꾩뿉??紐⑤뱺 ?곹뭹 議고쉶
    const naverProducts = await naverClient.getAllProducts();
    total = naverProducts.length;

    // 媛??곹뭹??DB??????낅뜲?댄듃
    for (const naverProduct of naverProducts) {
      try {
        const productData = naverClient.transformNaverProduct(naverProduct);

        // 湲곗〈 ?곹뭹 ?뺤씤
        const existingProduct = await db.product.findFirst({
          where: {
            userId,
            naverProductId: productData.naverProductId,
          },
        });

        if (existingProduct) {
          // ?낅뜲?댄듃
          await db.product.update({
            where: { id: existingProduct.id },
            data: {
              ...productData,
              lastSyncedAt: new Date(),
              syncStatus: 'SYNCED',
              syncError: null,
            },
          });
        } else {
          // ?앹꽦
          await db.product.create({
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
        console.error('?곹뭹 ?숆린???ㅻ쪟:', error);
        failed++;
      }
    }
  } catch (error) {
    console.error('?곹뭹 紐⑸줉 議고쉶 ?ㅻ쪟:', error);
    throw error;
  }

  return { total, synced, failed };
}

/**
 * ?ㅼ쓬 ?ㅽ뻾 ?쒓컙 怨꾩궛
 */
async function updateNextRunTime(scheduleId: string, cronExpression: string, timezone: string) {
  try {
    // 媛꾨떒??怨꾩궛: ?꾩옱 ?쒓컙 湲곗??쇰줈 ?ㅼ쓬 ?ㅽ뻾 ?쒓컙 異붿젙
    // ?ㅼ젣濡쒕뒗 cron-parser ?쇱씠釉뚮윭由??ъ슜 沅뚯옣
    const now = new Date();
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 湲곕낯 24?쒓컙 ??

    await db.syncSchedule.update({
      where: { id: scheduleId },
      data: { nextRun },
    });
  } catch (error) {
    console.error('?ㅼ쓬 ?ㅽ뻾 ?쒓컙 ?낅뜲?댄듃 ?ㅽ뙣:', error);
  }
}

/**
 * ?뚮┝ ?꾩넚
 */
async function sendNotification(schedule: any, status: string, details: any) {
  try {
    console.log(`?벁 ?뚮┝ ?꾩넚 - ?ъ슜?? ${schedule.userId}, ?곹깭: ${status}`);
    
    // ?ㅼ젣 ?대찓???꾩넚 濡쒖쭅? 異뷀썑 援ы쁽
    // ?? Nodemailer, SendGrid, AWS SES ??
    
    if (schedule.notifyEmail) {
      console.log(`?벂 ?대찓?? ${schedule.notifyEmail}`);
      console.log(`?뱤 ?곸꽭 ?뺣낫:`, details);
    }
    
    // TODO: ?ㅼ젣 ?대찓???꾩넚 援ы쁽
    // await sendEmail({
    //   to: schedule.notifyEmail,
    //   subject: `[GConnect] ?먮룞 ?숆린??${status === 'SUCCESS' ? '?꾨즺' : '?ㅽ뙣'}`,
    //   body: generateEmailBody(schedule, status, details),
    // });
  } catch (error) {
    console.error('?뚮┝ ?꾩넚 ?ㅽ뙣:', error);
  }
}

/**
 * 紐⑤뱺 ?щ줎 ?묒뾽 以묒?
 */
export function stopAllCronJobs() {
  console.log('?뱄툘 紐⑤뱺 ?щ줎 ?묒뾽 以묒? 以?..');
  cronJobs.forEach((task, userId) => {
    task.stop();
    console.log(`  ?뱄툘 ${userId}`);
  });
  cronJobs.clear();
  console.log('??紐⑤뱺 ?щ줎 ?묒뾽 以묒? ?꾨즺');
}

