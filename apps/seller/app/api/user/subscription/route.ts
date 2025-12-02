import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 사용자의 활성 구독 조회
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 현재 등록된 상품 수 조회
    const productCount = await prisma.product.count({
      where: {
        userId: session.user.id,
      },
    });

    // 구독이 없는 경우 기본 무료 플랜 정보 반환
    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        plan: {
          name: 'FREE',
          displayName: '무료 체험',
          maxProducts: 100,
          monthlyPrice: 0,
        },
        usage: {
          currentProducts: productCount,
          maxProducts: 100,
          remainingSlots: Math.max(0, 100 - productCount),
          usagePercentage: Math.min(100, (productCount / 100) * 100),
        },
        needsUpgrade: productCount >= 100,
      });
    }

    // 남은 슬롯 계산
    const remainingSlots = Math.max(0, subscription.plan.maxProducts - productCount);
    const usagePercentage = (productCount / subscription.plan.maxProducts) * 100;

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
      },
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        displayName: subscription.plan.displayName,
        description: subscription.plan.description,
        maxProducts: subscription.plan.maxProducts,
        monthlyPrice: subscription.plan.monthlyPrice,
        yearlyPrice: subscription.plan.yearlyPrice,
        features: subscription.plan.features ? JSON.parse(subscription.plan.features) : [],
      },
      usage: {
        currentProducts: productCount,
        maxProducts: subscription.plan.maxProducts,
        remainingSlots,
        usagePercentage: Math.min(100, usagePercentage),
      },
      needsUpgrade: productCount >= subscription.plan.maxProducts,
    });
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return NextResponse.json(
      { error: '구독 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

