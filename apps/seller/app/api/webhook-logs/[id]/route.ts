import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * Seller 웹훅 로그 상세 조회 API (Enterprise 전용)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const userId = session.user.id;

    // 구독 정보 조회 (Enterprise 플랜 확인)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptions: {
          where: {
            status: 'active',
          },
          include: {
            plan: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const isEnterprise = user?.subscriptions?.[0]?.plan?.name === 'ENTERPRISE';

    if (!isEnterprise) {
      return NextResponse.json(
        { error: '웹훅 로그는 Enterprise 플랜 사용자만 이용할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 로그 조회
    const log = await prisma.webhookLog.findUnique({
      where: { id: params.id },
      include: {
        webhook: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            userId: true,
          },
        },
      },
    });

    if (!log) {
      return NextResponse.json({ error: '로그를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 권한 확인 (본인의 웹훅 로그인지)
    if (log.webhook.userId !== userId) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
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
    console.error('[Webhook Log Detail] 조회 실패:', error);
    return NextResponse.json(
      { error: '웹훅 로그 상세 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

