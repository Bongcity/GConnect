import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { startOfMonth, subMonths, eachDayOfInterval, format } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = subMonths(now, 1);

    // 최근 30일 회원 가입 추이
    const userSignups = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    });

    // 날짜별로 그룹화
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
    const signupTrend = days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = userSignups.filter((u) => {
        const uDate = format(new Date(u.createdAt), 'yyyy-MM-dd');
        return uDate === dayStr;
      }).length;

      return {
        date: dayStr,
        count,
      };
    });

    // 최근 30일 상품 등록 추이
    const productCreations = await prisma.product.groupBy({
      by: ['created_at'],
      where: {
        created_at: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    });

    const productTrend = days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = productCreations.filter((p) => {
        const pDate = format(new Date(p.created_at), 'yyyy-MM-dd');
        return pDate === dayStr;
      }).length;

      return {
        date: dayStr,
        count,
      };
    });

    // Google 노출률 추이 (최근 30일)
    const totalProducts = await prisma.product.count();
    const googleExposedProducts = await prisma.product.count({
      where: { google_in: 1 },
    });

    const exposureRate = totalProducts > 0 ? (googleExposedProducts / totalProducts) * 100 : 0;

    // 동기화 성공률 (최근 30일)
    const syncLogs = await prisma.syncLog.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        status: true,
        createdAt: true,
      },
    });

    const syncTrend = days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayLogs = syncLogs.filter((log) => {
        const logDate = format(new Date(log.createdAt), 'yyyy-MM-dd');
        return logDate === dayStr;
      });

      const totalSyncs = dayLogs.length;
      const successSyncs = dayLogs.filter((log) => log.status === 'SUCCESS').length;
      const successRate = totalSyncs > 0 ? (successSyncs / totalSyncs) * 100 : 0;

      return {
        date: dayStr,
        successRate: Math.round(successRate),
      };
    });

    return NextResponse.json({
      signupTrend,
      productTrend,
      exposureRate: Math.round(exposureRate),
      syncTrend,
    });
  } catch (error) {
    console.error('Failed to fetch analytics overview:', error);
    return NextResponse.json(
      { error: '분석 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

