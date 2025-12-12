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
    let showDdroProducts = true;
    try {
      const settings = await prisma.systemSettings.findFirst();
      showDdroProducts = settings?.showDdroProducts ?? true;
    } catch (settingsError) {
      console.warn('[API /categories] ⚠️ SystemSettings 조회 실패, 기본값(true) 사용:', settingsError);
    }

    console.log(`[API /categories] 카테고리 조회 시작 (DDRo: ${showDdroProducts ? 'ON' : 'OFF'})`);

    let categories: Array<{
      category_name: string;
      category_cid: string;
      product_count: number;
    }> = [];

    if (showDdroProducts) {
      // DDRo ON: Seller 카테고리 우선 + DDRo 카테고리 추가
      console.log('[API /categories] DDRo ON - Seller 카테고리 우선 조회');
      
      // 1. Seller 상품 카테고리 조회 (GCONNECT DB)
      const sellerProducts = await prisma.product.findMany({
        where: {
          enabled: true,
          source_cid: { not: null }
        },
        select: {
          source_cid: true
        }
      });

      const sellerCidCounts = new Map<string, number>();
      sellerProducts.forEach(p => {
        if (p.source_cid) {
          sellerCidCounts.set(p.source_cid, (sellerCidCounts.get(p.source_cid) || 0) + 1);
        }
      });

      const sellerCids = Array.from(sellerCidCounts.keys());
      console.log(`[API /categories] Seller 상품 CID ${sellerCids.length}개`);

      // 2. Seller 카테고리명 조회
      const sellerCategories = new Map<string, { cid: string; count: number }>();
      
      if (sellerCids.length > 0) {
        const sellerCategoryData = await prisma.naverCategory.findMany({
          where: {
            cid: { in: sellerCids },
            category_1: { not: null }
          },
          select: {
            cid: true,
            category_1: true
          }
        });

        // category_1별로 그룹화
        const category1ToCids = new Map<string, Array<{cid: string, count: number}>>();
        sellerCategoryData.forEach(cat => {
          if (cat.category_1 && cat.cid) {
            const count = sellerCidCounts.get(cat.cid) || 0;
            if (!category1ToCids.has(cat.category_1)) {
              category1ToCids.set(cat.category_1, []);
            }
            category1ToCids.get(cat.category_1)!.push({ cid: cat.cid, count });
          }
        });

        // 각 category_1의 총 상품 수와 대표 cid 계산
        category1ToCids.forEach((cids, category1) => {
          const totalCount = cids.reduce((sum, item) => sum + item.count, 0);
          const representativeCid = cids.sort((a, b) => b.count - a.count)[0].cid;
          sellerCategories.set(category1, { cid: representativeCid, count: totalCount });
        });

        console.log(`[API /categories] Seller 카테고리 ${sellerCategories.size}개`);
      }

      // 3. DDRo 카테고리 조회 (Seller에 없는 카테고리만)
      const ddroCategories: Array<{
        category_name: string;
        category_cid: string;
        product_count: number;
      }> = await ddroPrisma.$queryRaw`
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
        SELECT 
          category_1 as category_name,
          representative_cid as category_cid,
          total_product_count as product_count
        FROM GroupedCategories
        ORDER BY total_product_count DESC
      `;

      console.log(`[API /categories] DDRo 카테고리 ${ddroCategories.length}개`);

      // 4. 병합: Seller 우선, DDRo 추가 (중복 제거)
      const categoryMap = new Map<string, { cid: string; count: number }>();
      
      // Seller 카테고리 우선 추가
      sellerCategories.forEach((data, name) => {
        categoryMap.set(name, data);
      });

      // DDRo 카테고리 추가 (중복 제외)
      ddroCategories.forEach(cat => {
        if (!categoryMap.has(cat.category_name)) {
          categoryMap.set(cat.category_name, {
            cid: cat.category_cid,
            count: Number(cat.product_count)
          });
        }
      });

      // 5. 결과 배열 생성 (Seller 우선 정렬)
      const sellerCategoryNames = new Set(sellerCategories.keys());
      categories = Array.from(categoryMap.entries())
        .map(([name, data]) => ({
          category_name: name,
          category_cid: data.cid,
          product_count: data.count
        }))
        .sort((a, b) => {
          // Seller 카테고리 우선
          const aIsSeller = sellerCategoryNames.has(a.category_name);
          const bIsSeller = sellerCategoryNames.has(b.category_name);
          
          if (aIsSeller && !bIsSeller) return -1;
          if (!aIsSeller && bIsSeller) return 1;
          
          // 같은 그룹 내에서는 상품 수 기준
          return b.product_count - a.product_count;
        })
        .slice(0, limit);

      console.log(`[API /categories] 최종 카테고리 ${categories.length}개 (Seller 우선)`);
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
      console.log(`[API /categories] DDRo OFF - Seller 상품 source_cid 개수: ${uniqueCids.length}`);
      console.log(`[API /categories] Unique CIDs:`, uniqueCids);
      
      if (uniqueCids.length > 0) {
        // DDRo OFF이므로 GCONNECT DB의 NaverCategory 사용
        const categoryData = await prisma.naverCategory.findMany({
          where: {
            cid: { in: uniqueCids },
            category_1: { not: null }
          },
          select: {
            cid: true,
            category_1: true
          }
        });
        
        console.log(`[API /categories] 조회된 카테고리 데이터 (${categoryData.length}개):`, categoryData);

        // category_1별로 그룹화하여 상품 수 합산
        // Step 1: category_1별로 모든 cid와 상품 수 수집
        const category1ToCids = new Map<string, Array<{cid: string, count: number}>>();
        categoryData.forEach(cat => {
          if (cat.category_1) {
            const count = cidCounts.get(cat.cid) || 0;
            if (!category1ToCids.has(cat.category_1)) {
              category1ToCids.set(cat.category_1, []);
            }
            category1ToCids.get(cat.category_1)!.push({ cid: cat.cid, count });
          }
        });

        // Step 2: 각 category_1에 대해 상품 수 합산 및 대표 cid 선택
        const category1Map = new Map<string, { cid: string; count: number }>();
        category1ToCids.forEach((cids, category1) => {
          const totalCount = cids.reduce((sum, item) => sum + item.count, 0);
          // 대표 cid는 상품 수가 가장 많은 것으로 선택
          const representativeCid = cids.sort((a, b) => b.count - a.count)[0].cid;
          category1Map.set(category1, { cid: representativeCid, count: totalCount });
          console.log(`[API /categories] ${category1}: ${totalCount}개 상품, 대표 cid: ${representativeCid}`);
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

