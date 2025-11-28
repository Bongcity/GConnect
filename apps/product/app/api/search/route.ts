import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/products';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');

    if (!q) {
      return NextResponse.json({
        combined: [],
        sellerCount: 0,
        globalCount: 0,
        total: 0,
        hasNextPage: false,
      });
    }

    // 정렬 옵션 매핑 (UI -> API)
    let sortBy: 'latest' | 'priceAsc' | 'priceDesc' = 'latest';
    if (sort === 'price_low') {
      sortBy = 'priceAsc';
    } else if (sort === 'price_high') {
      sortBy = 'priceDesc';
    }

    // SELLER 우선 통합 검색 (lib/products.ts의 searchProducts 사용)
    const result = await searchProducts(q, page, sortBy);

    return NextResponse.json({
      combined: result.combined,
      sellerCount: result.sellerCount,
      globalCount: result.globalCount,
      total: result.total,
      hasNextPage: result.hasNextPage,
    });
  } catch (error: any) {
    console.error('검색 실패:', error);
    return NextResponse.json(
      { error: '검색에 실패했습니다.' },
      { status: 500 }
    );
  }
}

