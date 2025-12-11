import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * Admin 웹훅 로그 상세 조회 API
 * 특정 로그의 상세 정보(요청/응답 본문 포함)를 조회합니다.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { logId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Admin 권한 확인
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 로그 조회
    const log = await prisma.webhookLog.findUnique({
      where: { id: params.logId },
      include: {
        webhook: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
          },
        },
      },
    });

    if (!log) {
      return NextResponse.json({ error: '로그를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      log: {
        id: log.id,
        webhookId: log.webhookId,
        webhookName: log.webhook.name,
        webhookUrl: log.webhook.url,
        webhookType: log.webhook.type,
        status: log.status,
        requestUrl: log.requestUrl,
        requestMethod: log.requestMethod,
        requestBody: log.requestBody,
        requestHeaders: log.requestHeaders,
        responseStatus: log.responseStatus,
        responseBody: log.responseBody,
        responseTime: log.responseTime,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt,
      },
    });
  } catch (error) {
    console.error('[Admin Webhook Log Detail] 조회 실패:', error);
    return NextResponse.json(
      { error: '웹훅 로그 상세 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

