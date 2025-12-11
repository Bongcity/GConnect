import { NextRequest, NextResponse } from 'next/server';
import { ddroPrisma, prisma } from '@gconnect/db';

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

    // SystemSettings 확인 - DDRo 상품 표시 여부
    const settings = await prisma.systemSettings.findFirst();
    const showDdroProducts = settings?.showDdroProducts ?? true;

    console.log(`[API /categories] 카테고리 조회 시작 (DDRo: ${showDdroProducts ? 'ON' : 'OFF'})`);

    let categories: Array<{
      category_name: string;
      category_cid: string;
      product_count: number;
    }> = [];

    if (showDdroProducts) {
      // DDRo ON: DDRo 상품의 카테고리 조회
      categories = await ddroPrisma.$queryRaw`
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
    } else {
      // DDRo OFF: Seller 상품(GCONNECT)의 카테고리만 조회
      // GCONNECT DB에서 Seller 상품의 source_cid를 그룹화하고
      // DDRo DB의 NaverCategories에서 카테고리명 조회
      const sellerProducts = await prisma.product.findMany({
        where: {
          enabled: true,
          source_cid: { not: null }
        },
        select: {
          source_cid: true
        }
      });

      // source_cid별 개수 집계
      const cidCounts = new Map<string, number>();
      sellerProducts.forEach(p => {
        if (p.source_cid) {
          cidCounts.set(p.source_cid, (cidCounts.get(p.source_cid) || 0) + 1);
        }
      });

      // 각 cid에 대해 카테고리명 조회
      const uniqueCids = Array.from(cidCounts.keys());
      if (uniqueCids.length > 0) {
        const categoryData = await ddroPrisma.$queryRaw<
          Array<{
            cid: string;
            category_1: string | null;
          }>
        >`
          SELECT DISTINCT cid, category_1
          FROM NaverCategories
          WHERE cid IN (${uniqueCids.join(',')})
            AND category_1 IS NOT NULL
        `;

        // category_1별로 그룹화하여 상품 수 합산
        const category1Map = new Map<string, { cid: string; count: number }>();
        categoryData.forEach(cat => {
          if (cat.category_1) {
            const count = cidCounts.get(cat.cid) || 0;
            const existing = category1Map.get(cat.category_1);
            if (!existing || count > existing.count) {
              category1Map.set(cat.category_1, { cid: cat.cid, count });
            } else {
              category1Map.set(cat.category_1, {
                cid: existing.cid,
                count: existing.count + count
              });
            }
          }
        });

        // 결과 배열 생성
        categories = Array.from(category1Map.entries())
          .map(([name, data]) => ({
            category_name: name,
            category_cid: data.cid,
            product_count: data.count
          }))
          .sort((a, b) => b.product_count - a.product_count)
          .slice(0, limit);
      }
    }

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

