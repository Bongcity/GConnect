import { NextRequest, NextResponse } from 'next/server';
import { ddroPrisma, prisma } from '@gconnect/db';

/**
 * 자동완성 검색어 조회 API
 * - 입력된 키워드와 유사한 모든 검색어 조회
 * - NaverShoppingKeywords 테이블 활용
 */
export async function GET(req: NextRequest) {
  try {
    // SystemSettings 확인 - DDRo 상품 표시 여부
    const settings = await prisma.systemSettings.findFirst();
    if (!settings || !settings.showDdroProducts) {
      console.log('[API /autocomplete] ⚠️ DDRo 상품 표시 비활성화됨');
      return NextResponse.json({ keywords: [] });
    }

    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!keyword || !keyword.trim() || keyword.length < 2) {
      return NextResponse.json({ keywords: [] });
    }

    console.log(`[API /autocomplete] 자동완성 검색어 조회: "${keyword}"`);

    // 입력 키워드를 포함하는 모든 검색어 조회
    const keywords = await ddroPrisma.$queryRaw<
      Array<{
        keyword: string;
        rank: number | null;
        category_1: string | null;
      }>
    >`
      SELECT DISTINCT TOP (${limit})
        keyword,
        rank,
        category_1
      FROM NaverShoppingKeywords
      WHERE 
        keyword IS NOT NULL 
        AND keyword != ${keyword}
        AND (
          keyword LIKE ${`${keyword}%`}
          OR keyword LIKE ${`%${keyword}%`}
        )
      ORDER BY 
        CASE 
          WHEN keyword LIKE ${`${keyword}%`} THEN 0
          ELSE 1
        END,
        CASE WHEN rank IS NULL THEN 999999 ELSE rank END ASC,
        LEN(keyword) ASC,
        keyword ASC
    `;

    console.log(`[API /autocomplete] ✅ ${keywords.length}개 자동완성 검색어 조회 완료`);

    return NextResponse.json({
      keywords: keywords.map(k => ({
        keyword: k.keyword,
        rank: k.rank,
        category: k.category_1,
      })),
    });
  } catch (error: any) {
    console.error('[API /autocomplete] ❌ 오류:', error);
    return NextResponse.json(
      { error: '자동완성 검색어 조회에 실패했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

