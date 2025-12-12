import { NextRequest, NextResponse } from 'next/server';
import { ddroPrisma, prisma } from '@gconnect/db';

/**
 * 카테고리별 인기 키워드 조회 API
 * - 특정 카테고리(cid)의 인기 검색어 조회
 * - NaverShoppingKeywords 테이블 활용
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cid = searchParams.get('cid'); // cid로 직접 조회
    const category1 = searchParams.get('category1');
    const category2 = searchParams.get('category2');
    const category3 = searchParams.get('category3');
    const limit = parseInt(searchParams.get('limit') || '15');

    console.log(`[API /category-keywords] 인기 키워드 조회: cid=${cid}, cat1=${category1}, cat2=${category2}, cat3=${category3}`);

    // SystemSettings 확인 - DDRo 상품 표시 여부
    let showDdroProducts = true;
    let sellerCids: string[] = [];
    
    try {
      const settings = await prisma.systemSettings.findFirst();
      showDdroProducts = settings?.showDdroProducts ?? true;
    } catch (settingsError) {
      // SystemSettings 테이블이 없으면 기본값 true 사용
    }

    // DDRo OFF일 때: Seller 상품의 CID 목록 가져오기
    if (!showDdroProducts) {
      console.log('[API /category-keywords] DDRo OFF - Seller 상품의 CID 기반 키워드 조회');
      
      const sellerProducts = await prisma.product.findMany({
        where: {
          enabled: true,
          source_cid: { not: null }
        },
        select: {
          source_cid: true
        },
        distinct: ['source_cid']
      });

      sellerCids = sellerProducts
        .map(p => p.source_cid)
        .filter((cid): cid is string => cid !== null);

      console.log(`[API /category-keywords] Seller 상품 CID ${sellerCids.length}개 발견`);
      
      // Seller 상품이 없으면 빈 배열 반환
      if (sellerCids.length === 0) {
        console.log('[API /category-keywords] Seller 상품 없음 - 빈 배열 반환');
        return NextResponse.json({ keywords: [] });
      }
    }

    let keywords: Array<{
      keyword: string;
      rank: number | null;
      category_1: string | null;
    }> = [];

    // 1순위: cid가 있으면 cid로 조회
    if (cid) {
      if (!showDdroProducts && !sellerCids.includes(cid)) {
        // DDRo OFF이고 해당 cid가 Seller 상품에 없으면 스킵
        console.log(`[API /category-keywords] cid ${cid}는 Seller 상품에 없음 - 스킵`);
      } else {
        keywords = await ddroPrisma.$queryRaw`
          SELECT DISTINCT TOP (${limit})
            keyword,
            rank,
            category_1
          FROM NaverShoppingKeywords
          WHERE keyword IS NOT NULL 
            AND cid = ${cid}
          ORDER BY 
            CASE WHEN rank IS NULL THEN 999999 ELSE rank END ASC,
            keyword ASC
        `;
        
        console.log(`[API /category-keywords] cid로 조회: ${keywords.length}개`);
      }
    }
    
    // 2순위: cid로 조회했는데 결과 없으면 카테고리명으로 조회
    if (keywords.length === 0 && category1) {
      if (category1 && category2 && category3) {
        keywords = await ddroPrisma.$queryRaw`
          SELECT DISTINCT TOP (${limit})
            keyword,
            rank,
            category_1
          FROM NaverShoppingKeywords
          WHERE keyword IS NOT NULL 
            AND category_1 = ${category1}
            AND category_2 = ${category2}
            AND category_3 = ${category3}
          ORDER BY 
            CASE WHEN rank IS NULL THEN 999999 ELSE rank END ASC,
            keyword ASC
        `;
      } else if (category1 && category2) {
        keywords = await ddroPrisma.$queryRaw`
          SELECT DISTINCT TOP (${limit})
            keyword,
            rank,
            category_1
          FROM NaverShoppingKeywords
          WHERE keyword IS NOT NULL 
            AND category_1 = ${category1}
            AND category_2 = ${category2}
          ORDER BY 
            CASE WHEN rank IS NULL THEN 999999 ELSE rank END ASC,
            keyword ASC
        `;
      } else if (category1) {
        keywords = await ddroPrisma.$queryRaw`
          SELECT DISTINCT TOP (${limit})
            keyword,
            rank,
            category_1
          FROM NaverShoppingKeywords
          WHERE keyword IS NOT NULL 
            AND category_1 = ${category1}
          ORDER BY 
            CASE WHEN rank IS NULL THEN 999999 ELSE rank END ASC,
            keyword ASC
        `;
      }
      
      console.log(`[API /category-keywords] 카테고리명으로 조회: ${keywords.length}개`);
    }
    
    // 3순위: 여전히 결과 없으면 전체 인기 키워드 반환
    if (keywords.length === 0) {
      if (!showDdroProducts && sellerCids.length > 0) {
        // DDRo OFF: Seller 상품의 CID에 해당하는 키워드만 조회
        const cidList = sellerCids.map(c => `'${c}'`).join(',');
        keywords = await ddroPrisma.$queryRaw`
          SELECT DISTINCT TOP (${limit})
            keyword,
            rank,
            category_1
          FROM NaverShoppingKeywords
          WHERE keyword IS NOT NULL 
            AND cid IN (${ddroPrisma.Prisma.raw(cidList)})
          ORDER BY 
            CASE WHEN rank IS NULL THEN 999999 ELSE rank END ASC,
            keyword ASC
        `;
        
        console.log(`[API /category-keywords] Seller CID 기반 인기 키워드 조회: ${keywords.length}개`);
      } else {
        // DDRo ON: 전체 인기 키워드 조회
        keywords = await ddroPrisma.$queryRaw`
          SELECT DISTINCT TOP (${limit})
            keyword,
            rank,
            category_1
          FROM NaverShoppingKeywords
          WHERE keyword IS NOT NULL 
          ORDER BY 
            CASE WHEN rank IS NULL THEN 999999 ELSE rank END ASC,
            keyword ASC
        `;
        
        console.log(`[API /category-keywords] 전체 인기 키워드 조회: ${keywords.length}개`);
      }
    }

    console.log(`[API /category-keywords] ✅ ${keywords.length}개 키워드 조회 완료`);

    return NextResponse.json({
      keywords: keywords.map(k => ({
        keyword: k.keyword,
        rank: k.rank,
        category: k.category_1,
      })),
    });
  } catch (error: any) {
    console.error('[API /category-keywords] ❌ 오류:', error);
    return NextResponse.json(
      { error: '인기 키워드 조회에 실패했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

