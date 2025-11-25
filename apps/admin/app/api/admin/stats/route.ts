import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    // 통계 데이터 조회
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { shopStatus: 'ACTIVE' },
    });
    const totalProducts = await prisma.product.count();

    // 오늘 동기화 횟수
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recentSyncs = await prisma.syncLog.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalProducts,
      recentSyncs,
    });
  } catch (error: any) {
    console.error('통계 조회 실패:', error);
    return NextResponse.json(
      { error: '통계 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

