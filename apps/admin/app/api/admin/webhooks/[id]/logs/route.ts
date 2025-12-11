import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * Admin 웹훅 로그 조회 API
 * 특정 웹훅의 로그 목록을 조회합니다.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Admin 권한 확인
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // Query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // 웹훅 존재 확인
    const webhook = await prisma.webhook.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!webhook) {
      return NextResponse.json({ error: '웹훅을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 로그 조회 (최근 로그부터)
    const logs = await prisma.webhookLog.findMany({
      where: {
        webhookId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      webhookName: webhook.name,
      logs: logs.map((log) => ({
        id: log.id,
        status: log.status,
        requestUrl: log.requestUrl,
        requestMethod: log.requestMethod,
        responseStatus: log.responseStatus,
        responseTime: log.responseTime,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error('[Admin Webhook Logs] 조회 실패:', error);
    return NextResponse.json(
      { error: '웹훅 로그 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

