import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get('months') || '6');

    // 월별 수익 데이터
    const monthlyData = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));

      // 해당 월의 활성 구독
      const subscriptions = await prisma.userSubscription.findMany({
        where: {
          status: { in: ['ACTIVE', 'TRIAL'] },
          startDate: { lte: monthEnd },
          OR: [
            { endDate: null },
            { endDate: { gte: monthStart } },
          ],
        },
        include: {
          plan: true,
        },
      });

      const revenue = subscriptions.reduce(
        (sum, sub) => sum + sub.plan.monthlyPrice,
        0
      );

      monthlyData.push({
        month: format(monthStart, 'yyyy-MM'),
        revenue,
        subscriptions: subscriptions.length,
      });
    }

    // 플랜별 수익 분포
    const planRevenue = await prisma.userSubscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      include: {
        plan: true,
      },
    });

    const planDistribution = planRevenue.reduce((acc: any, sub) => {
      const planName = sub.plan.displayName;
      if (!acc[planName]) {
        acc[planName] = {
          name: planName,
          value: 0,
          count: 0,
        };
      }
      acc[planName].value += sub.plan.monthlyPrice;
      acc[planName].count += 1;
      return acc;
    }, {});

    return NextResponse.json({
      monthlyData,
      planDistribution: Object.values(planDistribution),
    });
  } catch (error) {
    console.error('Revenue chart error:', error);
    return NextResponse.json(
      { error: '차트 데이터 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

