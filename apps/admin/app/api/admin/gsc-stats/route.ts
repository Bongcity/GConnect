import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * Admin용 Google Search Console 통계 API
 * 전체 셀러의 GSC 데이터를 집계하여 제공
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Admin 권한 확인
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    console.log(`[API /admin/gsc-stats] 조회 시작: ${days}일`);

    // 전체 GSC 통계 집계
    const totalStats = await prisma.googleSearchStat.aggregate({
      where: {
        date: { gte: startDate },
      },
      _sum: {
        impressions: true,
        clicks: true,
      },
    });

    const totalImpressions = Number(totalStats._sum.impressions || 0);
    const totalClicks = Number(totalStats._sum.clicks || 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // 노출된 상품 수 (최소 1회 이상 노출)
    const exposedProducts = await prisma.googleSearchStat.groupBy({
      by: ['productId'],
      where: {
        date: { gte: startDate },
        impressions: { gt: 0 },
      },
    });

    // 전체 활성 상품 수
    const totalProducts = await prisma.product.count({
      where: { enabled: true },
    });

    // 셀러별 통계 (상위 10명)
    const sellerStats = await prisma.$queryRaw<
      Array<{
        userId: string;
        userName: string;
        userEmail: string;
        totalImpressions: bigint;
        totalClicks: bigint;
        productCount: bigint;
      }>
    >`
      SELECT 
        u.id as userId,
        u.name as userName,
        u.email as userEmail,
        SUM(gss.impressions) as totalImpressions,
        SUM(gss.clicks) as totalClicks,
        COUNT(DISTINCT gss.productId) as productCount
      FROM GoogleSearchStats gss
      INNER JOIN affiliate_products ap ON gss.productId = ap.id
      INNER JOIN Users u ON ap.userId = u.id
      WHERE gss.date >= ${startDate}
      GROUP BY u.id, u.name, u.email
      ORDER BY SUM(gss.impressions) DESC
    `;

    // 날짜별 추이 데이터
    const dailyStats = await prisma.$queryRaw<
      Array<{
        date: Date;
        impressions: bigint;
        clicks: bigint;
      }>
    >`
      SELECT 
        date,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks
      FROM GoogleSearchStats
      WHERE date >= ${startDate}
      GROUP BY date
      ORDER BY date ASC
    `;

    // 상위 성과 상품 (노출수 기준 Top 10)
    const topProducts = await prisma.$queryRaw<
      Array<{
        productId: bigint;
        productName: string;
        userName: string;
        totalImpressions: bigint;
        totalClicks: bigint;
      }>
    >`
      SELECT TOP 10
        ap.id as productId,
        ap.product_name as productName,
        u.name as userName,
        SUM(gss.impressions) as totalImpressions,
        SUM(gss.clicks) as totalClicks
      FROM GoogleSearchStats gss
      INNER JOIN affiliate_products ap ON gss.productId = ap.id
      INNER JOIN Users u ON ap.userId = u.id
      WHERE gss.date >= ${startDate}
      GROUP BY ap.id, ap.product_name, u.name
      ORDER BY SUM(gss.impressions) DESC
    `;

    console.log(`[API /admin/gsc-stats] 집계 완료: 노출 ${totalImpressions}, 클릭 ${totalClicks}`);

    return NextResponse.json({
      ok: true,
      period: days,
      summary: {
        totalImpressions,
        totalClicks,
        avgCtr: Number(avgCtr.toFixed(2)),
        exposedProducts: exposedProducts.length,
        totalProducts,
      },
      sellerStats: sellerStats.map((s) => ({
        userId: s.userId,
        userName: s.userName,
        userEmail: s.userEmail,
        impressions: Number(s.totalImpressions),
        clicks: Number(s.totalClicks),
        productCount: Number(s.productCount),
        ctr:
          Number(s.totalImpressions) > 0
            ? Number(((Number(s.totalClicks) / Number(s.totalImpressions)) * 100).toFixed(2))
            : 0,
      })),
      dailyTrend: dailyStats.map((d) => ({
        date: d.date.toISOString().split('T')[0],
        impressions: Number(d.impressions),
        clicks: Number(d.clicks),
        ctr:
          Number(d.impressions) > 0
            ? Number(((Number(d.clicks) / Number(d.impressions)) * 100).toFixed(2))
            : 0,
      })),
      topProducts: topProducts.map((p) => ({
        productId: Number(p.productId),
        productName: p.productName,
        userName: p.userName,
        impressions: Number(p.totalImpressions),
        clicks: Number(p.totalClicks),
        ctr:
          Number(p.totalImpressions) > 0
            ? Number(((Number(p.totalClicks) / Number(p.totalImpressions)) * 100).toFixed(2))
            : 0,
      })),
    });
  } catch (error) {
    console.error('[API /admin/gsc-stats] ❌ 오류:', error);
    return NextResponse.json(
      { error: 'GSC 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

