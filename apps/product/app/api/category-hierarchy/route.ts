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
        // DDRo ON: Seller 카테고리 우선 + DDRo 카테고리 추가
        console.log('[API /category-hierarchy] DDRo ON - Seller 카테고리 우선 조회');
        
        // 1. Seller 상품 카테고리 조회 (GCONNECT DB)
        const sellerProducts = await prisma.product.findMany({
          where: { enabled: true, source_cid: { not: null } },
          select: { source_cid: true }
        });

        const sellerCidCounts = new Map<string, number>();
        sellerProducts.forEach(p => {
          if (p.source_cid) {
            sellerCidCounts.set(p.source_cid, (sellerCidCounts.get(p.source_cid) || 0) + 1);
          }
        });

        const sellerCids = Array.from(sellerCidCounts.keys());
        console.log(`[API /category-hierarchy] Seller 상품 ${sellerProducts.length}개, 고유 CID ${sellerCids.length}개`);

        // 2. Seller 카테고리명 조회
        const sellerCategories = new Map<string, { totalCount: number; cids: Array<{ cid: string; count: number }> }>();
        
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

          console.log(`[API /category-hierarchy] Seller NaverCategories ${sellerCategoryData.length}개 조회됨`);

          // category_1별로 그룹화
          sellerCategoryData.forEach(cat => {
            if (cat.category_1 && cat.cid) {
              const count = sellerCidCounts.get(cat.cid) || 0;
              
              if (!sellerCategories.has(cat.category_1)) {
                sellerCategories.set(cat.category_1, { totalCount: 0, cids: [] });
              }
              
              const group = sellerCategories.get(cat.category_1)!;
              group.totalCount += count;
              group.cids.push({ cid: cat.cid, count });
            }
          });

          console.log(`[API /category-hierarchy] Seller 카테고리 ${sellerCategories.size}개`);
        }

        // 3. DDRo 카테고리 조회
        let ddroCategories: Array<{
          category_1: string;
          cid: string;
          product_count: number;
        }> = [];
        
        try {
          ddroCategories = await ddroPrisma.$queryRaw`
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
          
          console.log(`[API /category-hierarchy] DDRo DB 조회 성공: ${ddroCategories.length}개 카테고리`);
        } catch (ddroError: any) {
          console.error('[API /category-hierarchy] 🔴 DDRo DB 조회 실패:', ddroError.message);
        }

        // 4. 병합: Seller 우선, DDRo 추가 (중복 제거)
        const categoryMap = new Map<string, { cid: string; count: number }>();
        
        // Seller 카테고리 우선 추가
        sellerCategories.forEach((data, name) => {
          const representativeCid = data.cids.sort((a, b) => b.count - a.count)[0].cid;
          categoryMap.set(name, {
            cid: representativeCid,
            count: data.totalCount
          });
        });

        // DDRo 카테고리 추가 (중복 제외)
        ddroCategories.forEach(cat => {
          if (!categoryMap.has(cat.category_1)) {
            categoryMap.set(cat.category_1, {
              cid: cat.cid,
              count: Number(cat.product_count)
            });
          }
        });

        // 5. 결과 배열 생성 (Seller 우선 정렬)
        const sellerCategoryNames = new Set(sellerCategories.keys());
        categories = Array.from(categoryMap.entries())
          .map(([name, data]) => ({
            category_1: name,
            cid: data.cid,
            product_count: data.count
          }))
          .sort((a, b) => {
            // Seller 카테고리 우선
            const aIsSeller = sellerCategoryNames.has(a.category_1);
            const bIsSeller = sellerCategoryNames.has(b.category_1);
            
            if (aIsSeller && !bIsSeller) return -1;
            if (!aIsSeller && bIsSeller) return 1;
            
            // 같은 그룹 내에서는 상품 수 기준
            return b.product_count - a.product_count;
          });

        console.log(`[API /category-hierarchy] 최종 1단계 카테고리 ${categories.length}개: ${categories.slice(0, 3).map(c => `${c.category_1} (${c.product_count}개)`).join(', ')}...`);
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
          // NaverCategories에서 카테고리명 조회
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

          console.log(`[API /category-hierarchy] NaverCategories에서 ${categoryData.length}개 레코드 조회됨`);
          console.log(`[API /category-hierarchy] 카테고리 데이터:`, categoryData.map(c => `${c.category_1} (${c.cid})`).join(', '));

          // category_1별로 그룹핑하고 상품 수 합산
          const category1Map = new Map<string, { totalCount: number; cids: Array<{ cid: string; count: number }> }>();
          
          categoryData.forEach(cat => {
            if (cat.category_1 && cat.cid) {
              const count = cidCounts.get(cat.cid) || 0;
              
              if (!category1Map.has(cat.category_1)) {
                category1Map.set(cat.category_1, { totalCount: 0, cids: [] });
              }
              
              const group = category1Map.get(cat.category_1)!;
              group.totalCount += count;
              group.cids.push({ cid: cat.cid, count });
            }
          });

          console.log(`[API /category-hierarchy] 그룹핑 결과:`, 
            Array.from(category1Map.entries()).map(([name, data]) => 
              `${name}: ${data.totalCount}개 (${data.cids.length}개 CID)`
            ).join(', ')
          );

          // 각 category_1의 대표 CID 선택 (가장 상품이 많은 CID)
          categories = Array.from(category1Map.entries())
            .map(([name, data]) => {
              const representativeCid = data.cids.sort((a, b) => b.count - a.count)[0].cid;
              return {
                category_1: name,
                cid: representativeCid,
                product_count: data.totalCount
              };
            })
            .sort((a, b) => b.product_count - a.product_count);

          console.log(`[API /category-hierarchy] 최종 1단계 카테고리 ${categories.length}개:`,
            categories.map(c => `${c.category_1} (${c.product_count}개)`).join(', ')
          );
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
      let categories: Array<{
        category_2: string | null;
        cid: string;
        product_count: number;
      }> = [];

      if (showDdroProducts) {
        // DDRo ON: Seller 우선 + DDRo 추가
        console.log(`[API /category-hierarchy] DDRo ON - 2단계 조회 (Seller 우선): ${category1}`);
        
        // 1. Seller 상품 조회
        const sellerProducts = await prisma.product.findMany({
          where: { enabled: true, source_cid: { not: null } },
          select: { source_cid: true }
        });

        const sellerCidCounts = new Map<string, number>();
        sellerProducts.forEach(p => {
          if (p.source_cid) {
            sellerCidCounts.set(p.source_cid, (sellerCidCounts.get(p.source_cid) || 0) + 1);
          }
        });

        const sellerCids = Array.from(sellerCidCounts.keys());
        
        // 2. Seller 2단계 카테고리 조회
        const sellerCategories = new Map<string, { totalCount: number; cids: Array<{ cid: string; count: number }> }>();
        
        if (sellerCids.length > 0) {
          const sellerCategoryData = await prisma.naverCategory.findMany({
            where: {
              cid: { in: sellerCids },
              category_1: category1,
              category_2: { not: null }
            },
            select: {
              cid: true,
              category_2: true
            }
          });

          sellerCategoryData.forEach(cat => {
            if (cat.category_2 && cat.cid) {
              const count = sellerCidCounts.get(cat.cid) || 0;
              
              if (!sellerCategories.has(cat.category_2)) {
                sellerCategories.set(cat.category_2, { totalCount: 0, cids: [] });
              }
              
              const group = sellerCategories.get(cat.category_2)!;
              group.totalCount += count;
              group.cids.push({ cid: cat.cid, count });
            }
          });
        }

        // 3. DDRo 2단계 카테고리 조회
        const ddroCategories: Array<{
          category_2: string | null;
          cid: string;
          product_count: number;
        }> = await ddroPrisma.$queryRaw`
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

        // 4. 병합: Seller 우선
        const categoryMap = new Map<string, { cid: string; count: number }>();
        
        sellerCategories.forEach((data, name) => {
          const representativeCid = data.cids.sort((a, b) => b.count - a.count)[0].cid;
          categoryMap.set(name, {
            cid: representativeCid,
            count: data.totalCount
          });
        });

        ddroCategories.forEach(cat => {
          if (cat.category_2 && !categoryMap.has(cat.category_2)) {
            categoryMap.set(cat.category_2, {
              cid: cat.cid,
              count: Number(cat.product_count)
            });
          }
        });

        // 5. 정렬
        const sellerCategoryNames = new Set(sellerCategories.keys());
        categories = Array.from(categoryMap.entries())
          .map(([name, data]) => ({
            category_2: name,
            cid: data.cid,
            product_count: data.count
          }))
          .sort((a, b) => {
            const aIsSeller = sellerCategoryNames.has(a.category_2 || '');
            const bIsSeller = sellerCategoryNames.has(b.category_2 || '');
            
            if (aIsSeller && !bIsSeller) return -1;
            if (!aIsSeller && bIsSeller) return 1;
            
            return b.product_count - a.product_count;
          });
      } else {
        // DDRo OFF: GCONNECT DB (Seller 상품)
        console.log(`[API /category-hierarchy] DDRo OFF - 2단계 조회: ${category1}`);
        
        const sellerProducts = await prisma.product.findMany({
          where: { enabled: true, source_cid: { not: null } },
          select: { source_cid: true }
        });

        const cidCounts = new Map<string, number>();
        sellerProducts.forEach(p => {
          if (p.source_cid) {
            cidCounts.set(p.source_cid, (cidCounts.get(p.source_cid) || 0) + 1);
          }
        });

        const uniqueCids = Array.from(cidCounts.keys());
        
        if (uniqueCids.length > 0) {
          const categoryData = await prisma.naverCategory.findMany({
            where: {
              cid: { in: uniqueCids },
              category_1: category1,
              category_2: { not: null }
            },
            select: {
              cid: true,
              category_2: true
            }
          });

          // category_2별로 그룹핑
          const category2Map = new Map<string, { totalCount: number; cids: Array<{ cid: string; count: number }> }>();
          
          categoryData.forEach(cat => {
            if (cat.category_2 && cat.cid) {
              const count = cidCounts.get(cat.cid) || 0;
              
              if (!category2Map.has(cat.category_2)) {
                category2Map.set(cat.category_2, { totalCount: 0, cids: [] });
              }
              
              const group = category2Map.get(cat.category_2)!;
              group.totalCount += count;
              group.cids.push({ cid: cat.cid, count });
            }
          });

          categories = Array.from(category2Map.entries())
            .map(([name, data]) => {
              const representativeCid = data.cids.sort((a, b) => b.count - a.count)[0].cid;
              return {
                category_2: name,
                cid: representativeCid,
                product_count: data.totalCount
              };
            })
            .sort((a, b) => b.product_count - a.product_count);

          console.log(`[API /category-hierarchy] 2단계 카테고리 ${categories.length}개:`,
            categories.map(c => `${c.category_2} (${c.product_count}개)`).join(', ')
          );
        }
      }

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
      let categories: Array<{
        category_3: string | null;
        cid: string;
        product_count: number;
      }> = [];

      if (showDdroProducts) {
        // DDRo ON: Seller 우선 + DDRo 추가
        console.log(`[API /category-hierarchy] DDRo ON - 3단계 조회 (Seller 우선): ${category1} > ${category2}`);
        
        // 1. Seller 상품 조회
        const sellerProducts = await prisma.product.findMany({
          where: { enabled: true, source_cid: { not: null } },
          select: { source_cid: true }
        });

        const sellerCidCounts = new Map<string, number>();
        sellerProducts.forEach(p => {
          if (p.source_cid) {
            sellerCidCounts.set(p.source_cid, (sellerCidCounts.get(p.source_cid) || 0) + 1);
          }
        });

        const sellerCids = Array.from(sellerCidCounts.keys());
        
        // 2. Seller 3단계 카테고리 조회
        const sellerCategories = new Map<string, { totalCount: number; cids: Array<{ cid: string; count: number }> }>();
        
        if (sellerCids.length > 0) {
          const sellerCategoryData = await prisma.naverCategory.findMany({
            where: {
              cid: { in: sellerCids },
              category_1: category1,
              category_2: category2,
              category_3: { not: null }
            },
            select: {
              cid: true,
              category_3: true
            }
          });

          sellerCategoryData.forEach(cat => {
            if (cat.category_3 && cat.cid) {
              const count = sellerCidCounts.get(cat.cid) || 0;
              
              if (!sellerCategories.has(cat.category_3)) {
                sellerCategories.set(cat.category_3, { totalCount: 0, cids: [] });
              }
              
              const group = sellerCategories.get(cat.category_3)!;
              group.totalCount += count;
              group.cids.push({ cid: cat.cid, count });
            }
          });
        }

        // 3. DDRo 3단계 카테고리 조회
        const ddroCategories: Array<{
          category_3: string | null;
          cid: string;
          product_count: number;
        }> = await ddroPrisma.$queryRaw`
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

        // 4. 병합: Seller 우선
        const categoryMap = new Map<string, { cid: string; count: number }>();
        
        sellerCategories.forEach((data, name) => {
          const representativeCid = data.cids.sort((a, b) => b.count - a.count)[0].cid;
          categoryMap.set(name, {
            cid: representativeCid,
            count: data.totalCount
          });
        });

        ddroCategories.forEach(cat => {
          if (cat.category_3 && !categoryMap.has(cat.category_3)) {
            categoryMap.set(cat.category_3, {
              cid: cat.cid,
              count: Number(cat.product_count)
            });
          }
        });

        // 5. 정렬
        const sellerCategoryNames = new Set(sellerCategories.keys());
        categories = Array.from(categoryMap.entries())
          .map(([name, data]) => ({
            category_3: name,
            cid: data.cid,
            product_count: data.count
          }))
          .sort((a, b) => {
            const aIsSeller = sellerCategoryNames.has(a.category_3 || '');
            const bIsSeller = sellerCategoryNames.has(b.category_3 || '');
            
            if (aIsSeller && !bIsSeller) return -1;
            if (!aIsSeller && bIsSeller) return 1;
            
            return b.product_count - a.product_count;
          });
      } else {
        // DDRo OFF: GCONNECT DB (Seller 상품)
        console.log(`[API /category-hierarchy] DDRo OFF - 3단계 조회: ${category1} > ${category2}`);
        
        const sellerProducts = await prisma.product.findMany({
          where: { enabled: true, source_cid: { not: null } },
          select: { source_cid: true }
        });

        const cidCounts = new Map<string, number>();
        sellerProducts.forEach(p => {
          if (p.source_cid) {
            cidCounts.set(p.source_cid, (cidCounts.get(p.source_cid) || 0) + 1);
          }
        });

        const uniqueCids = Array.from(cidCounts.keys());
        
        if (uniqueCids.length > 0) {
          const categoryData = await prisma.naverCategory.findMany({
            where: {
              cid: { in: uniqueCids },
              category_1: category1,
              category_2: category2,
              category_3: { not: null }
            },
            select: {
              cid: true,
              category_3: true
            }
          });

          // category_3별로 그룹핑
          const category3Map = new Map<string, { totalCount: number; cids: Array<{ cid: string; count: number }> }>();
          
          categoryData.forEach(cat => {
            if (cat.category_3 && cat.cid) {
              const count = cidCounts.get(cat.cid) || 0;
              
              if (!category3Map.has(cat.category_3)) {
                category3Map.set(cat.category_3, { totalCount: 0, cids: [] });
              }
              
              const group = category3Map.get(cat.category_3)!;
              group.totalCount += count;
              group.cids.push({ cid: cat.cid, count });
            }
          });

          categories = Array.from(category3Map.entries())
            .map(([name, data]) => {
              const representativeCid = data.cids.sort((a, b) => b.count - a.count)[0].cid;
              return {
                category_3: name,
                cid: representativeCid,
                product_count: data.totalCount
              };
            })
            .sort((a, b) => b.product_count - a.product_count);

          console.log(`[API /category-hierarchy] 3단계 카테고리 ${categories.length}개:`,
            categories.map(c => `${c.category_3} (${c.product_count}개)`).join(', ')
          );
        }
      }

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

