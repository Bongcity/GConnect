import { NextRequest, NextResponse } from 'next/server';
import { ddroPrisma, prisma } from '@gconnect/db';

/**
 * 카테고리 계층 구조 조회 API
 * - 1단계: 전체 대분류 목록
 * - 2단계: 선택한 대분류의 중분류 목록
 * - 3단계: 선택한 중분류의 소분류 목록
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category1 = searchParams.get('category1');
    const category2 = searchParams.get('category2');

    // SystemSettings 확인 - DDRo 상품 표시 여부
    let showDdroProducts = true;
    try {
      const settings = await prisma.systemSettings.findFirst();
      showDdroProducts = settings?.showDdroProducts ?? true;
      console.log('[API /category-hierarchy] ✅ SystemSettings 조회 성공:', settings);
    } catch (settingsError: any) {
      console.error('[API /category-hierarchy] ⚠️ SystemSettings 조회 실패, 기본값(true) 사용:', settingsError.message);
      // SystemSettings 테이블이 없으면 생성 안내
      if (settingsError.message?.includes('Invalid object name') || settingsError.message?.includes('does not exist')) {
        console.error('[API /category-hierarchy] 🔴 SystemSettings 테이블이 없습니다! scripts/create-system-settings-table.sql 실행 필요');
      }
    }

    console.log(`[API /category-hierarchy] 조회 시작 (DDRo: ${showDdroProducts ? 'ON' : 'OFF'}): category1=${category1}, category2=${category2}`);

    // 1단계: 대분류만 조회 (대표 cid 포함)
    if (!category1) {
      let categories: Array<{
        category_1: string;
        cid: string;
        product_count: number;
      }> = [];

      if (showDdroProducts) {
        // DDRo ON: DDRo 상품 포함
        console.log('[API /category-hierarchy] DDRo ON - DDRo DB에서 카테고리 조회');
        
        try {
          categories = await ddroPrisma.$queryRaw`
            WITH RankedCategories AS (
              SELECT 
                nc.category_1,
                nc.cid,
                COUNT(DISTINCT ap.id) as product_count,
                ROW_NUMBER() OVER (PARTITION BY nc.category_1 ORDER BY COUNT(DISTINCT ap.id) DESC) as rn
              FROM NaverCategories nc
              LEFT JOIN affiliate_products ap ON nc.cid = ap.source_cid AND ap.enabled = 1
              WHERE nc.category_1 IS NOT NULL
              GROUP BY nc.category_1, nc.cid
            )
            SELECT 
              category_1,
              cid,
              SUM(product_count) as product_count
            FROM RankedCategories
            WHERE rn = 1
            GROUP BY category_1, cid
            ORDER BY SUM(product_count) DESC
          `;
          
          console.log(`[API /category-hierarchy] DDRo DB 조회 성공: ${categories.length}개 카테고리`);
        } catch (ddroError: any) {
          console.error('[API /category-hierarchy] 🔴 DDRo DB 조회 실패:', ddroError.message);
          categories = [];
        }
      } else {
        // DDRo OFF: Seller 상품만 (GCONNECT DB)
        console.log('[API /category-hierarchy] DDRo OFF - Seller 상품에서 카테고리 조회');
        
        const sellerProducts = await prisma.product.findMany({
          where: { enabled: true, source_cid: { not: null } },
          select: { source_cid: true }
        });

        console.log(`[API /category-hierarchy] Seller 상품 ${sellerProducts.length}개 발견`);

        const cidCounts = new Map<string, number>();
        sellerProducts.forEach(p => {
          if (p.source_cid) {
            cidCounts.set(p.source_cid, (cidCounts.get(p.source_cid) || 0) + 1);
          }
        });

        const uniqueCids = Array.from(cidCounts.keys());
        console.log(`[API /category-hierarchy] 고유 CID ${uniqueCids.length}개:`, uniqueCids.slice(0, 5));

        if (uniqueCids.length > 0) {
          // Prisma의 올바른 방식으로 IN 쿼리 수정
          const categoryData = await ddroPrisma.naverCategories.findMany({
            where: {
              cid: { in: uniqueCids },
              category_1: { not: null }
            },
            select: {
              cid: true,
              category_1: true
            },
            distinct: ['cid', 'category_1']
          });

          console.log(`[API /category-hierarchy] NaverCategories에서 ${categoryData.length}개 카테고리명 조회됨`);

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

          categories = Array.from(category1Map.entries())
            .map(([name, data]) => ({
              category_1: name,
              cid: data.cid,
              product_count: data.count
            }))
            .sort((a, b) => b.product_count - a.product_count);

          console.log(`[API /category-hierarchy] 최종 1단계 카테고리 ${categories.length}개`);
        }
      }

      const result = {
        level: 1,
        categories: categories.map(c => ({
          name: c.category_1,
          cid: c.cid,
          productCount: Number(c.product_count),
        })),
      };

      console.log(`[API /category-hierarchy] ✅ 1단계 카테고리 응답: ${result.categories.length}개`);
      return NextResponse.json(result);
    }

    // 2단계: 중분류 조회 (대표 cid 포함)
    if (category1 && !category2) {
      // DDRo OFF시에는 2단계 이상은 지원하지 않음 (복잡도 때문)
      if (!showDdroProducts) {
        return NextResponse.json({
          level: 2,
          parent: category1,
          categories: [],
        });
      }

      const categories = await ddroPrisma.$queryRaw<
        Array<{
          category_2: string | null;
          cid: string;
          product_count: number;
        }>
      >`
        WITH RankedCategories AS (
          SELECT 
            nc.category_2,
            nc.cid,
            COUNT(DISTINCT ap.id) as product_count,
            ROW_NUMBER() OVER (PARTITION BY nc.category_2 ORDER BY COUNT(DISTINCT ap.id) DESC) as rn
          FROM NaverCategories nc
          LEFT JOIN affiliate_products ap ON nc.cid = ap.source_cid AND ap.enabled = 1
          WHERE nc.category_1 = ${category1}
            AND nc.category_2 IS NOT NULL
          GROUP BY nc.category_2, nc.cid
        )
        SELECT 
          category_2,
          cid,
          SUM(product_count) as product_count
        FROM RankedCategories
        WHERE rn = 1
        GROUP BY category_2, cid
        ORDER BY SUM(product_count) DESC
      `;

      return NextResponse.json({
        level: 2,
        parent: category1,
        categories: categories
          .filter(c => c.category_2)
          .map(c => ({
            name: c.category_2,
            cid: c.cid,
            productCount: Number(c.product_count),
          })),
      });
    }

    // 3단계: 소분류 조회
    if (category1 && category2) {
      // DDRo OFF시에는 3단계는 지원하지 않음
      if (!showDdroProducts) {
        return NextResponse.json({
          level: 3,
          parent: { category1, category2 },
          categories: [],
        });
      }

      const categories = await ddroPrisma.$queryRaw<
        Array<{
          category_3: string | null;
          cid: string;
          product_count: number;
        }>
      >`
        SELECT DISTINCT
          nc.category_3,
          nc.cid,
          COUNT(DISTINCT ap.id) as product_count
        FROM NaverCategories nc
        LEFT JOIN affiliate_products ap ON nc.cid = ap.source_cid AND ap.enabled = 1
        WHERE nc.category_1 = ${category1}
          AND nc.category_2 = ${category2}
          AND nc.category_3 IS NOT NULL
        GROUP BY nc.category_3, nc.cid
        ORDER BY COUNT(DISTINCT ap.id) DESC
      `;

      return NextResponse.json({
        level: 3,
        parent: { category1, category2 },
        categories: categories
          .filter(c => c.category_3)
          .map(c => ({
            name: c.category_3,
            cid: c.cid,
            productCount: Number(c.product_count),
          })),
      });
    }

    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /category-hierarchy] ❌ 오류:', error);
    return NextResponse.json(
      { error: '카테고리 계층 조회에 실패했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

