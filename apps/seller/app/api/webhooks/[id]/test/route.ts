import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { testWebhook } from '@/lib/webhook';

// 웹훅 테스트
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 웹훅 존재 확인
    const webhook = await prisma.webhook.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: '웹훅을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 테스트 실행
    const log = await testWebhook(params.id);

    return NextResponse.json({
      ok: true,
      log,
    });
  } catch (error: any) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: error.message || '웹훅 테스트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

