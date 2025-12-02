import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 모든 구독 조회 (사용자 및 플랜 정보 포함)
    const subscriptions = await prisma.userSubscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            shopName: true,
          },
        },
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 각 사용자의 현재 상품 수 조회
    const subscriptionsWithProducts = await Promise.all(
      subscriptions.map(async (sub) => {
        const productCount = await prisma.product.count({
          where: {
            userId: sub.userId,
          },
        });

        return {
          ...sub,
          currentProducts: productCount,
        };
      })
    );

    return NextResponse.json({
      subscriptions: subscriptionsWithProducts,
    });
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json(
      { error: '구독 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

