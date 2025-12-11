import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * 웹훅 테스트 API
 * Admin이 웹훅 설정이 올바른지 테스트할 수 있습니다.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Admin 권한 확인
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    console.log(`[Webhook Test] 테스트 시작: ${params.id}`);

    // 웹훅 조회
    const webhook = await prisma.webhook.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            shopName: true,
          },
        },
      },
    });

    if (!webhook) {
      return NextResponse.json({ error: '웹훅을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 테스트 페이로드 생성
    const testPayload = {
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

    const startTime = Date.now();
    let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let responseStatus: number | null = null;
    let responseBody: string | null = null;
    let errorMessage: string | null = null;

    try {
      // 웹훅 타입별 페이로드 변환
      let requestBody: string;
      if (webhook.type === 'SLACK') {
        requestBody = JSON.stringify(buildSlackPayload(testPayload));
      } else if (webhook.type === 'DISCORD') {
        requestBody = JSON.stringify(buildDiscordPayload(testPayload));
      } else {
        requestBody = JSON.stringify(testPayload);
      }

      // HTTP 요청 실행
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      responseStatus = response.status;
      responseBody = await response.text();

      if (!response.ok) {
        status = 'FAILED';
        errorMessage = `HTTP ${response.status}: ${responseBody}`;
      }

      console.log(`[Webhook Test] 테스트 성공: ${webhook.name}`);
    } catch (error: any) {
      status = 'FAILED';
      errorMessage = error.message;
      console.error(`[Webhook Test] 테스트 실패: ${webhook.name}`, error);
    }

    const responseTime = Date.now() - startTime;

    // 웹훅 로그 저장
    const log = await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        requestUrl: webhook.url,
        requestMethod: 'POST',
        requestBody: JSON.stringify(testPayload),
        requestHeaders: JSON.stringify({ 'Content-Type': 'application/json' }),
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

    console.log(`[Webhook Test] 테스트 완료: ${status}`);

    return NextResponse.json({
      ok: true,
      log: {
        id: log.id,
        status: log.status,
        responseStatus: log.responseStatus,
        responseTime: log.responseTime,
        responseBody: log.responseBody,
        errorMessage: log.errorMessage,
        requestUrl: log.requestUrl,
        createdAt: log.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[Webhook Test] 테스트 실패:', error);
    return NextResponse.json(
      { error: error.message || '웹훅 테스트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * Slack 메시지 포맷
 */
function buildSlackPayload(payload: any) {
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

  return {
    text: `${emoji} ${title} (테스트)`,
    attachments: [
      {
        color,
        title: `${emoji} ${title}`,
        fields,
        footer: 'GConnect 자동 동기화 (테스트)',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };
}

/**
 * Discord 메시지 포맷
 */
function buildDiscordPayload(payload: any) {
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

  return {
    content: `${emoji} ${title} (테스트)`,
    embeds: [
      {
        title: `${emoji} ${title}`,
        color,
        fields,
        footer: {
          text: 'GConnect 자동 동기화 (테스트)',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

