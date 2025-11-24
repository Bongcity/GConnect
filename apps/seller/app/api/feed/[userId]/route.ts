import { NextResponse } from 'next/server';
import { db } from '@gconnect/db';
import { generateGoogleShoppingFeed, productToFeedProduct } from '@/lib/google-feed';

// 피드 XML 제공 (공개 API - 인증 불필요)
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // 피드 설정 조회
    const feedSettings = await db.feedSettings.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            shopName: true,
            naverShopUrl: true,
          },
        },
      },
    });

    if (!feedSettings) {
      return new NextResponse('Feed not found', { status: 404 });
    }

    // 상품 조회
    const products = await db.product.findMany({
      where: {
        userId,
        isActive: feedSettings.includeInactive ? undefined : true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 베이스 URL 설정
    const baseUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3003';
    const storeUrl = feedSettings.storeUrl || baseUrl;

    // 피드 설정
    const feedConfig = {
      title: feedSettings.feedTitle,
      description: feedSettings.feedDescription || '네이버 스마트스토어 상품 피드',
      link: storeUrl,
      language: 'ko',
      currency: 'KRW',
    };

    // 상품 데이터 변환
    const feedProducts = products.map((product) =>
      productToFeedProduct(product, storeUrl)
    );

    // XML 생성
    const xml = generateGoogleShoppingFeed(feedConfig, feedProducts);

    // 피드 통계 업데이트
    await db.feedSettings.update({
      where: { id: feedSettings.id },
      data: {
        lastGenerated: new Date(),
        totalProducts: products.length,
      },
    });

    // XML 응답 반환
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시
      },
    });
  } catch (error) {
    console.error('Feed generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


