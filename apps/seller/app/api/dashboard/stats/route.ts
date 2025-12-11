import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * 대시보드 통계 조회
 * Query params:
 * - days: 조회 기간 (기본 7일)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 사용자 정보 조회 (네이버 API 연결 여부)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        naverApiEnabled: true,
        naverClientId: true,
        naverClientSecret: true,
      },
    });

    // 상품 통계
    const totalProducts = await prisma.product.count({
      where: { userId },
    });

    const activeProducts = await prisma.product.count({
      where: {
        userId,
        enabled: true,
      },
    });

    // 구글 노출 통계 (Search Console API)
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 사용자의 모든 상품 ID 조회
    const userProducts = await prisma.product.findMany({
      where: { userId },
      select: { id: true },
    });

    const productIds = userProducts.map(p => p.id);

    // GSC 통계 집계
    const gscStats = await prisma.googleSearchStat.aggregate({
      where: {
        productId: { in: productIds },
        date: { gte: startDate },
      },
      _sum: {
        impressions: true,
        clicks: true,
      },
    });

    const googleImpressions = gscStats._sum.impressions || 0;
    const googleClicks = gscStats._sum.clicks || 0;

    // 네이버 API 연결 여부
    const naverApiConnected = 
      user?.naverApiEnabled === true && 
      !!user?.naverClientId && 
      !!user?.naverClientSecret;

    return NextResponse.json({
      totalProducts,
      activeProducts,
      naverApiConnected,
      googleExposureCount: googleImpressions, // 노출수
      googleClicksCount: googleClicks, // 클릭수 (추가)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: '통계 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

