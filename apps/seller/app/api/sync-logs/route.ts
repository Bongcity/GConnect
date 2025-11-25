import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

// ?�기??로그 조회
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?�증???�요?�니??' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const logs = await prisma.syncLog.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      logs,
    });
  } catch (error) {
    console.error('Get sync logs error:', error);
    return NextResponse.json(
      { error: '로그 조회 �??�류가 발생?�습?�다.' },
      { status: 500 }
    );
  }
}

