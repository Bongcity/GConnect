import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { subDays, startOfDay, format } from 'date-fns';

// 분석 데이터 조회 (Google Search Console 실제 데이터)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = startOfDay(subDays(endDate, days));

    console.log(`[API /analytics] 조회 시작: ${days}일, 사용자 ${session.user.id}`);

    // 사용자의 모든 상품 조회
    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        product_name: true,
        enabled: true,
        google_in: true,
      },
    });

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.enabled).length;
    const exposedProducts = products.filter((p) => p.google_in === 1).length;
    const productIds = products.map(p => p.id);

    console.log(`[API /analytics] 상품 통계: 전체 ${totalProducts}, 활성 ${activeProducts}, 노출 ${exposedProducts}`);

    // GoogleSearchStats에서 실제 데이터 조회
    const gscStats = await prisma.googleSearchStat.findMany({
      where: {
        productId: { in: productIds },
        date: { gte: startDate },
      },
      orderBy: {
        date: 'asc',
      },
    });

    console.log(`[API /analytics] GSC 데이터: ${gscStats.length}개 레코드`);

    // 날짜별로 그룹핑
    const dailyMap = new Map<string, { impressions: number; clicks: number }>();
    
    gscStats.forEach(stat => {
      const dateKey = format(new Date(stat.date), 'yyyy-MM-dd');
      const existing = dailyMap.get(dateKey) || { impressions: 0, clicks: 0 };
      existing.impressions += stat.impressions;
      existing.clicks += stat.clicks;
      dailyMap.set(dateKey, existing);
    });

    // 모든 날짜에 대해 데이터 생성 (빈 날짜는 0으로)
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const stats = dailyMap.get(dateKey) || { impressions: 0, clicks: 0 };
      const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
      
      dailyData.push({
        date: dateKey,
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: Number(ctr.toFixed(2)),
      });
    }

    // 합계 계산
    const totalImpressions = gscStats.reduce((sum, s) => sum + s.impressions, 0);
    const totalClicks = gscStats.reduce((sum, s) => sum + s.clicks, 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    console.log(`[API /analytics] 집계 완료: 노출 ${totalImpressions}, 클릭 ${totalClicks}, CTR ${avgCtr.toFixed(2)}%`);

    return NextResponse.json({
      ok: true,
      summary: {
        totalImpressions,
        totalClicks,
        avgCtr: Number(avgCtr.toFixed(2)),
        totalProducts,
        activeProducts,
        exposedProducts,
      },
      dailyData,
      trafficSources: {
        organic: totalClicks, // GSC는 모두 자연 검색
        direct: 0,
        referral: 0,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: '분석 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


