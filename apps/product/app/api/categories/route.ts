import { NextRequest, NextResponse } from 'next/server';
import { ddroPrisma } from '@gconnect/db';

/**
 * 카테고리 목록 조회 API
 * - 대분류(category_1) 기준
 * - 각 카테고리별 상품 수 포함
 * - 상품 수 기준 인기순 정렬
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('[API /categories] 카테고리 조회 시작...');

    // 대분류별 상품 수 합산 및 대표 cid 선택
    const categories = await ddroPrisma.$queryRaw<
      Array<{
        category_name: string;
        category_cid: string;
        product_count: number;
      }>
    >`
      WITH CategoryStats AS (
        SELECT 
          nc.category_1,
          nc.cid,
          COUNT(DISTINCT ap.id) as product_count,
          ROW_NUMBER() OVER (PARTITION BY nc.category_1 ORDER BY COUNT(DISTINCT ap.id) DESC) as rn
        FROM NaverCategories nc
        LEFT JOIN affiliate_products ap ON nc.cid = ap.source_cid AND ap.enabled = 1
        WHERE nc.category_1 IS NOT NULL
        GROUP BY nc.category_1, nc.cid
      ),
      GroupedCategories AS (
        SELECT 
          category_1,
          MAX(CASE WHEN rn = 1 THEN cid END) as representative_cid,
          SUM(product_count) as total_product_count
        FROM CategoryStats
        GROUP BY category_1
      )
      SELECT TOP (${limit})
        category_1 as category_name,
        representative_cid as category_cid,
        total_product_count as product_count
      FROM GroupedCategories
      ORDER BY total_product_count DESC
    `;

    console.log(`[API /categories] ✅ ${categories.length}개 카테고리 조회 완료`);

    return NextResponse.json({
      categories: categories.map(cat => ({
        name: cat.category_name,
        cid: cat.category_cid,
        productCount: Number(cat.product_count),
      })),
    });
  } catch (error: any) {
    console.error('[API /categories] ❌ 오류:', error);
    return NextResponse.json(
      { error: '카테고리 조회에 실패했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

