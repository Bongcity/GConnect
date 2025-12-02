import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month'; // month, last_month, 3months, year

    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case 'last_month':
        startDate = startOfMonth(subMonths(new Date(), 1));
        endDate = endOfMonth(subMonths(new Date(), 1));
        break;
      case '3months':
        startDate = subMonths(new Date(), 3);
        break;
      case 'year':
        startDate = startOfYear(new Date());
        break;
      case 'month':
      default:
        startDate = startOfMonth(new Date());
        break;
    }

    // 활성 구독 수
    const activeSubscriptions = await prisma.userSubscription.count({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
    });

    // 전체 구독 수
    const totalSubscriptions = await prisma.userSubscription.count();

    // 플랜별 구독 수
    const subscriptionsByPlan = await prisma.userSubscription.groupBy({
      by: ['planId'],
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      _count: true,
    });

    const plans = await prisma.plan.findMany();
    const planStats = plans.map((plan) => {
      const count =
        subscriptionsByPlan.find((s) => s.planId === plan.id)?._count || 0;
      return {
        planId: plan.id,
        planName: plan.displayName,
        count,
        monthlyRevenue: count * plan.monthlyPrice,
      };
    });

    // 월간 수익 (활성 구독 기준)
    const monthlyRevenue = planStats.reduce(
      (sum, stat) => sum + stat.monthlyRevenue,
      0
    );

    // 연간 예상 수익
    const yearlyRevenue = monthlyRevenue * 12;

    // 평균 ARPU (Average Revenue Per User)
    const arpu = activeSubscriptions > 0 ? monthlyRevenue / activeSubscriptions : 0;

    // 최근 구독 추이 (최근 6개월)
    const subscriptionTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));

      const count = await prisma.userSubscription.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      subscriptionTrend.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM
        count,
      });
    }

    return NextResponse.json({
      stats: {
        activeSubscriptions,
        totalSubscriptions,
        monthlyRevenue,
        yearlyRevenue,
        arpu: Math.round(arpu),
      },
      planStats,
      subscriptionTrend,
    });
  } catch (error) {
    console.error('Revenue stats error:', error);
    return NextResponse.json(
      { error: '수익 통계 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

