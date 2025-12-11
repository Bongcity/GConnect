import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * 대시보드 통계 조회
 */
export async function GET() {
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

    // 구글 노출 통계 (최근 30일)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // TODO: 실제 구글 Analytics 연동 시 수정 필요
    // 현재는 예시로 0을 반환
    const googleExposureCount = 0;

    // 네이버 API 연결 여부
    const naverApiConnected = 
      user?.naverApiEnabled === true && 
      !!user?.naverClientId && 
      !!user?.naverClientSecret;

    return NextResponse.json({
      totalProducts,
      activeProducts,
      naverApiConnected,
      googleExposureCount,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: '통계 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

