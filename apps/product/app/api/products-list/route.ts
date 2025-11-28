import { NextRequest, NextResponse } from 'next/server';
import { getComposedProducts } from '@/lib/products';

/**
 * 상품 목록 조회 API
 * - 카테고리 필터, 키워드 검색, 정렬, 페이지네이션 지원
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const keyword = searchParams.get('keyword') || undefined;
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 정렬 옵션 변환
    let sortBy: 'latest' | 'priceAsc' | 'priceDesc' = 'latest';
    if (sort === 'price_low') {
      sortBy = 'priceAsc';
    } else if (sort === 'price_high') {
      sortBy = 'priceDesc';
    }

    // 통합 상품 조회
    const result = await getComposedProducts({
      category,
      keyword,
      sortBy,
      page,
      pageSize,
    });

    return NextResponse.json({
      combined: result.combined,
      sellerProducts: result.sellerProducts,
      globalProducts: result.globalProducts,
      total: result.total,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('[API /products-list] 오류:', error);
    return NextResponse.json(
      { error: '상품 목록 조회에 실패했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

