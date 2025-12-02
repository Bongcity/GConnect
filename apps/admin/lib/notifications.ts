import { prisma } from '@gconnect/db';

interface CreateNotificationParams {
  type: 'SYSTEM' | 'SYNC' | 'PAYMENT' | 'PLAN' | 'INQUIRY';
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  link?: string;
  metadata?: any;
}

/**
 * 관리자 알림 생성
 */
export async function createAdminNotification(params: CreateNotificationParams) {
  try {
    // 알림 설정 확인
    const settings = await prisma.notificationSettings.findFirst();

    // 알림이 활성화되어 있는지 확인
    let isEnabled = true;
    if (settings) {
      switch (params.type) {
        case 'SYNC':
          isEnabled = settings.syncFailureEnabled;
          break;
        case 'PAYMENT':
          isEnabled = settings.paymentFailureEnabled;
          break;
        case 'PLAN':
          isEnabled = settings.planExpiryEnabled;
          break;
        case 'INQUIRY':
          isEnabled = settings.inquiryEnabled;
          break;
      }
    }

    if (!isEnabled) {
      console.log(`알림이 비활성화되어 있습니다: ${params.type}`);
      return null;
    }

    // 알림 생성
    const notification = await prisma.adminNotification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        severity: params.severity,
        link: params.link,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });

    console.log(`✅ 알림 생성: ${params.title}`);

    // 이메일 알림 전송 (설정되어 있는 경우)
    if (settings?.emailEnabled && settings.emailAddress) {
      // TODO: 이메일 전송 로직 추가
      console.log(`📧 이메일 알림 전송: ${settings.emailAddress}`);
    }

    // Slack 알림 전송 (설정되어 있는 경우)
    if (settings?.slackWebhook) {
      // TODO: Slack 웹훅 전송 로직 추가
      console.log(`💬 Slack 알림 전송`);
    }

    // Discord 알림 전송 (설정되어 있는 경우)
    if (settings?.discordWebhook) {
      // TODO: Discord 웹훅 전송 로직 추가
      console.log(`💬 Discord 알림 전송`);
    }

    return notification;
  } catch (error) {
    console.error('알림 생성 실패:', error);
    return null;
  }
}

/**
 * 동기화 실패 알림
 */
export async function notifySyncFailure(userId: string, errorMessage: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, shopName: true },
  });

  return createAdminNotification({
    type: 'SYNC',
    title: '동기화 실패',
    message: `${user?.shopName || user?.email}의 동기화가 실패했습니다. 오류: ${errorMessage}`,
    severity: 'ERROR',
    link: `/dashboard/sync-monitor`,
    metadata: { userId, errorMessage },
  });
}

/**
 * 결제 실패 알림
 */
export async function notifyPaymentFailure(
  subscriptionId: string,
  errorMessage: string
) {
  const subscription = await prisma.userSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: { select: { email: true, shopName: true } },
      plan: { select: { displayName: true } },
    },
  });

  if (!subscription) return null;

  return createAdminNotification({
    type: 'PAYMENT',
    title: '결제 실패',
    message: `${subscription.user.shopName || subscription.user.email}의 ${
      subscription.plan.displayName
    } 플랜 결제가 실패했습니다. 오류: ${errorMessage}`,
    severity: 'ERROR',
    link: `/dashboard/revenue/payments`,
    metadata: { subscriptionId, errorMessage },
  });
}

/**
 * 플랜 만료 임박 알림
 */
export async function notifyPlanExpiry(subscriptionId: string, daysLeft: number) {
  const subscription = await prisma.userSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: { select: { email: true, shopName: true } },
      plan: { select: { displayName: true } },
    },
  });

  if (!subscription) return null;

  return createAdminNotification({
    type: 'PLAN',
    title: '플랜 만료 임박',
    message: `${subscription.user.shopName || subscription.user.email}의 ${
      subscription.plan.displayName
    } 플랜이 ${daysLeft}일 후 만료됩니다.`,
    severity: daysLeft <= 3 ? 'ERROR' : 'WARNING',
    link: `/dashboard/subscriptions`,
    metadata: { subscriptionId, daysLeft },
  });
}

/**
 * 신규 문의 알림
 */
export async function notifyNewInquiry(inquiryId: number) {
  const inquiry = await prisma.iRInquiry.findUnique({
    where: { id: inquiryId },
    select: {
      storeName: true,
      email: true,
      inquiryType: true,
      planIntent: true,
    },
  });

  if (!inquiry) return null;

  return createAdminNotification({
    type: 'INQUIRY',
    title: '신규 문의 접수',
    message: `${inquiry.storeName}(${inquiry.email})에서 ${inquiry.inquiryType} 문의가 접수되었습니다. 플랜 의도: ${inquiry.planIntent || '미정'}`,
    severity: 'INFO',
    link: `/dashboard/support/inquiries`,
    metadata: { inquiryId },
  });
}

