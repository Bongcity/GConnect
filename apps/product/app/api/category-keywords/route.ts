import { NextRequest, NextResponse } from 'next/server';
import { ddroPrisma, prisma } from '@gconnect/db';

/**
 * 카테고리별 인기 키워드 조회 API
 * - 특정 카테고리(cid)의 인기 검색어 조회
 * - NaverShoppingKeywords 테이블 활용
 */
export async function GET(req: NextRequest) {
  try {
    // SystemSettings 확인 - DDRo 상품 표시 여부
    let showDdroProducts = true;
    try {
      const settings = await prisma.systemSettings.findFirst();
      showDdroProducts = settings?.showDdroProducts ?? true;
    } catch (settingsError) {
      // SystemSettings 테이블이 없으면 기본값 true 사용
    }

    if (!showDdroProducts) {
      console.log('[API /category-keywords] ⚠️ DDRo 상품 표시 비활성화됨');
      return NextResponse.json({ keywords: [] });
    }

    const { searchParams } = new URL(req.url);
    const cid = searchParams.get('cid'); // cid로 직접 조회
    const category1 = searchParams.get('category1');
    const category2 = searchParams.get('category2');
    const category3 = searchParams.get('category3');
    const limit = parseInt(searchParams.get('limit') || '15');

    console.log(`[API /category-keywords] 인기 키워드 조회: cid=${cid}, cat1=${category1}, cat2=${category2}, cat3=${category3}`);

    let keywords: Array<{
      keyword: string;
      rank: number | null;
      category_1: string | null;
    }> = [];

    // 1순위: cid가 있으면 cid로 조회
    if (cid) {
      keywords = await ddroPrisma.$queryRaw`
        SELECT TOP (${limit})
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
    
    // 2순위: cid로 조회했는데 결과 없으면 카테고리명으로 조회
    if (keywords.length === 0 && category1) {
      if (category1 && category2 && category3) {
        keywords = await ddroPrisma.$queryRaw`
          SELECT TOP (${limit})
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
          SELECT TOP (${limit})
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
          SELECT TOP (${limit})
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
      keywords = await ddroPrisma.$queryRaw`
        SELECT TOP (${limit})
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

