/**
 * 웹훅 시스템
 * 
 * 동기화 완료 시 외부 시스템에 알림을 보냅니다.
 */

import { prisma } from '@gconnect/db';
import { decrypt } from './crypto';

export interface WebhookPayload {
  event: 'sync.success' | 'sync.error';
  timestamp: string;
  data: {
    userId: string;
    shopName?: string;
    status: string;
    itemsTotal: number;
    itemsSynced: number;
    itemsFailed: number;
    duration?: number;
    error?: string;
  };
}

/**
 * 웹훅 트리거
 */
export async function triggerWebhooks(userId: string, payload: WebhookPayload) {
  try {
    // 사용자의 활성화된 웹훅 조회
    const webhooks = await prisma.webhook.findMany({
      where: {
        userId,
        isEnabled: true,
        ...(payload.event === 'sync.success'
          ? { triggerOnSuccess: true }
          : { triggerOnError: true }),
      },
    });

    if (webhooks.length === 0) {
      console.log('웹훅 없음 - 스킵');
      return;
    }

    console.log(`📡 웹훅 트리거: ${webhooks.length}개`);

    // 병렬로 모든 웹훅 실행
    await Promise.all(
      webhooks.map((webhook) => executeWebhook(webhook, payload))
    );
  } catch (error) {
    console.error('웹훅 트리거 오류:', error);
  }
}

/**
 * 웹훅 실행 (재시도 포함)
 */
async function executeWebhook(webhook: any, payload: WebhookPayload) {
  const startTime = Date.now();
  let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let errorMessage: string | null = null;
  let requestBody: string = '';
  let requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 웹훅 타입별 페이로드 준비
  if (webhook.type === 'SLACK') {
    requestBody = JSON.stringify(buildSlackPayload(payload));
  } else if (webhook.type === 'DISCORD') {
    requestBody = JSON.stringify(buildDiscordPayload(payload));
  } else {
    // CUSTOM
    requestBody = JSON.stringify(payload);
  }

  // 인증 헤더 추가
  if (webhook.authType && webhook.authValue) {
    try {
      const authValue = decrypt(webhook.authValue);
      if (webhook.authType === 'BEARER') {
        requestHeaders['Authorization'] = `Bearer ${authValue}`;
      } else if (webhook.authType === 'BASIC') {
        requestHeaders['Authorization'] = `Basic ${authValue}`;
      }
    } catch (e) {
      console.error('인증 값 복호화 오류:', e);
    }
  }

  // 커스텀 헤더 추가
  if (webhook.customHeaders) {
    try {
      const customHeaders = JSON.parse(webhook.customHeaders);
      requestHeaders = { ...requestHeaders, ...customHeaders };
    } catch (e) {
      console.error('커스텀 헤더 파싱 오류:', e);
    }
  }

  // 재시도 로직
  const maxRetries = webhook.retryEnabled ? webhook.maxRetries || 3 : 0;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      if (attempt > 0) {
        console.log(`🔄 웹훅 재시도 (${attempt}/${maxRetries}): ${webhook.name}`);
        // 재시도 전 대기
        await new Promise(resolve => setTimeout(resolve, (webhook.retryDelay || 5) * 1000));
      }

      // HTTP 요청 실행
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody,
      });

      responseStatus = response.status;
      responseBody = await response.text();

      if (response.ok) {
        status = 'SUCCESS';
        errorMessage = null;
        console.log(`✅ 웹훅 전송 성공: ${webhook.name}${attempt > 0 ? ` (재시도 ${attempt}회 후 성공)` : ''}`);
        break; // 성공 시 루프 탈출
      } else {
        status = 'FAILED';
        errorMessage = `HTTP ${response.status}: ${responseBody}`;
        
        if (attempt >= maxRetries) {
          console.error(`❌ 웹훅 전송 최종 실패: ${webhook.name} (${maxRetries}회 재시도 후)`);
        } else if (webhook.retryEnabled) {
          // 재시도 가능한 경우 다음 시도
          attempt++;
          continue;
        } else {
          // 재시도 비활성화
          break;
        }
      }
    } catch (error: any) {
      status = 'FAILED';
      errorMessage = error.message;
      
      if (attempt >= maxRetries) {
        console.error(`❌ 웹훅 전송 최종 실패: ${webhook.name}`, error);
      } else if (webhook.retryEnabled) {
        // 재시도 가능한 경우 다음 시도
        attempt++;
        continue;
      } else {
        // 재시도 비활성화
        console.error(`❌ 웹훅 전송 실패: ${webhook.name}`, error);
        break;
      }
    }
    
    attempt++;
  }

  const responseTime = Date.now() - startTime;

  // 웹훅 로그 저장
  await prisma.webhookLog.create({
    data: {
      webhookId: webhook.id,
      requestUrl: webhook.url,
      requestMethod: 'POST',
      requestBody: JSON.stringify(payload),
      requestHeaders: JSON.stringify(requestHeaders),
      responseStatus,
      responseBody,
      responseTime,
      status,
      errorMessage,
    },
  });

  // 웹훅 통계 업데이트
  await prisma.webhook.update({
    where: { id: webhook.id },
    data: {
      lastTriggered: new Date(),
      lastStatus: status,
      totalTriggers: { increment: 1 },
      successTriggers: status === 'SUCCESS' ? { increment: 1 } : undefined,
      failedTriggers: status === 'FAILED' ? { increment: 1 } : undefined,
    },
  });
}

/**
 * Slack 메시지 포맷
 */
function buildSlackPayload(payload: WebhookPayload) {
  const { event, data } = payload;
  const isSuccess = event === 'sync.success';

  const color = isSuccess ? 'good' : 'danger';
  const emoji = isSuccess ? '✅' : '❌';
  const title = isSuccess ? '자동 동기화 완료' : '자동 동기화 실패';

  const fields = [
    {
      title: '상점',
      value: data.shopName || '알 수 없음',
      short: true,
    },
    {
      title: '상태',
      value: isSuccess ? '성공' : '실패',
      short: true,
    },
    {
      title: '총 상품',
      value: `${data.itemsTotal}개`,
      short: true,
    },
    {
      title: '동기화 성공',
      value: `${data.itemsSynced}개`,
      short: true,
    },
  ];

  if (data.itemsFailed > 0) {
    fields.push({
      title: '동기화 실패',
      value: `${data.itemsFailed}개`,
      short: true,
    });
  }

  if (data.duration) {
    fields.push({
      title: '소요 시간',
      value: `${(data.duration / 1000).toFixed(2)}초`,
      short: true,
    });
  }

  const attachment: any = {
    color,
    title: `${emoji} ${title}`,
    fields,
    footer: 'GConnect 자동 동기화',
    ts: Math.floor(Date.now() / 1000),
  };

  if (!isSuccess && data.error) {
    attachment.text = `오류: ${data.error}`;
  }

  return {
    text: `${emoji} ${title}`,
    attachments: [attachment],
  };
}

/**
 * Discord 메시지 포맷
 */
function buildDiscordPayload(payload: WebhookPayload) {
  const { event, data } = payload;
  const isSuccess = event === 'sync.success';

  const color = isSuccess ? 0x22f089 : 0xff4d4f;
  const emoji = isSuccess ? '✅' : '❌';
  const title = isSuccess ? '자동 동기화 완료' : '자동 동기화 실패';

  const fields = [
    {
      name: '상점',
      value: data.shopName || '알 수 없음',
      inline: true,
    },
    {
      name: '상태',
      value: isSuccess ? '성공' : '실패',
      inline: true,
    },
    {
      name: '총 상품',
      value: `${data.itemsTotal}개`,
      inline: true,
    },
    {
      name: '동기화 성공',
      value: `${data.itemsSynced}개`,
      inline: true,
    },
  ];

  if (data.itemsFailed > 0) {
    fields.push({
      name: '동기화 실패',
      value: `${data.itemsFailed}개`,
      inline: true,
    });
  }

  if (data.duration) {
    fields.push({
      name: '소요 시간',
      value: `${(data.duration / 1000).toFixed(2)}초`,
      inline: true,
    });
  }

  const embed: any = {
    title: `${emoji} ${title}`,
    color,
    fields,
    footer: {
      text: 'GConnect 자동 동기화',
    },
    timestamp: new Date().toISOString(),
  };

  if (!isSuccess && data.error) {
    embed.description = `**오류:** ${data.error}`;
  }

  return {
    content: `${emoji} ${title}`,
    embeds: [embed],
  };
}

/**
 * 웹훅 테스트
 */
export async function testWebhook(webhookId: string) {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
    include: {
      user: {
        select: {
          shopName: true,
        },
      },
    },
  });

  if (!webhook) {
    throw new Error('웹훅을 찾을 수 없습니다.');
  }

  // 테스트 페이로드
  const testPayload: WebhookPayload = {
    event: 'sync.success',
    timestamp: new Date().toISOString(),
    data: {
      userId: webhook.userId,
      shopName: webhook.user.shopName || '테스트 상점',
      status: 'SUCCESS',
      itemsTotal: 10,
      itemsSynced: 10,
      itemsFailed: 0,
      duration: 5000,
    },
  };

  await executeWebhook(webhook, testPayload);

  // 최근 로그 조회
  const log = await prisma.webhookLog.findFirst({
    where: { webhookId },
    orderBy: { createdAt: 'desc' },
  });

  return log;
}

