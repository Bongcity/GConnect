import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * Seller 웹훅 로그 조회 API (Enterprise 전용)
 */
export async function GET(req: NextRequest) {
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

    // Query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'SUCCESS' | 'FAILED' | null
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // 사용자의 웹훅 조회
    const webhooks = await prisma.webhook.findMany({
      where: { userId },
      select: { id: true },
    });

    const webhookIds = webhooks.map((w) => w.id);

    if (webhookIds.length === 0) {
      return NextResponse.json({
        logs: [],
        pagination: {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // 필터 조건
    const where: any = {
      webhookId: { in: webhookIds },
    };

    if (status && (status === 'SUCCESS' || status === 'FAILED')) {
      where.status = status;
    }

    // 전체 개수
    const total = await prisma.webhookLog.count({ where });

    // 로그 조회
    const logs = await prisma.webhookLog.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        webhookId: log.webhookId,
        webhookName: log.webhook.name,
        webhookUrl: log.webhook.url,
        webhookType: log.webhook.type,
        status: log.status,
        responseStatus: log.responseStatus,
        responseTime: log.responseTime,
        requestUrl: log.requestUrl,
        createdAt: log.createdAt,
        // 요청/응답 본문은 상세 조회에서만 제공
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[Webhook Logs] 조회 실패:', error);
    return NextResponse.json(
      { error: '웹훅 로그 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

