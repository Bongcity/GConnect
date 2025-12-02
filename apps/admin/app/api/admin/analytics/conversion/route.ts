import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month'; // month, quarter, year

    let startDate = startOfMonth(new Date());
    if (period === 'quarter') {
      startDate = subMonths(startOfMonth(new Date()), 2);
    } else if (period === 'year') {
      startDate = subMonths(startOfMonth(new Date()), 11);
    }

    const endDate = endOfMonth(new Date());

    // 플랜별 전환율 계산
    const plans = await prisma.plan.findMany({
      select: { id: true, displayName: true },
    });

    const conversionData = await Promise.all(
      plans.map(async (plan) => {
        // 체험 사용자 (TRIAL 상태로 시작한 사용자)
        const trials = await prisma.userSubscription.count({
          where: {
            planId: plan.id,
            status: 'TRIAL',
            createdAt: { gte: startDate, lte: endDate },
          },
        });

        // 전환 사용자 (TRIAL에서 ACTIVE로 전환된 사용자)
        const conversions = await prisma.userSubscription.count({
          where: {
            planId: plan.id,
            status: 'ACTIVE',
            createdAt: { gte: startDate, lte: endDate },
          },
        });

        const conversionRate = trials > 0 ? Math.round((conversions / trials) * 100) : 0;

        return {
          planName: plan.displayName,
          trials,
          conversions,
          conversionRate,
        };
      })
    );

    return NextResponse.json({
      conversionData,
    });
  } catch (error) {
    console.error('Failed to fetch conversion analytics:', error);
    return NextResponse.json(
      { error: '전환율 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

