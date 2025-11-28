import { NextRequest, NextResponse } from 'next/server';
import { ddroPrisma } from '@gconnect/db';

/**
 * 관련 검색어 조회 API
 * - 입력된 키워드와 유사한 네이버 쇼핑 키워드 조회
 * - NaverShoppingKeywords 테이블 활용
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!keyword || !keyword.trim()) {
      return NextResponse.json({ relatedKeywords: [] });
    }

    console.log(`[API /related-keywords] 세분화된 검색어 조회: "${keyword}"`);

    // 입력 키워드를 포함한 더 세분화된 검색어 조회
    // 예: "치마" → "빅사이즈 치마", "롱 치마", "미니 치마" 등
    const relatedKeywords = await ddroPrisma.$queryRaw<
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
        AND keyword LIKE ${`%${keyword}%`}
        AND status = 'completed'
        AND LEN(keyword) > LEN(${keyword})
      ORDER BY 
        CASE WHEN rank IS NULL THEN 999999 ELSE rank END ASC,
        LEN(keyword) ASC,
        keyword ASC
    `;

    console.log(`[API /related-keywords] ✅ ${relatedKeywords.length}개 관련 검색어 조회 완료`);

    return NextResponse.json({
      relatedKeywords: relatedKeywords.map(k => ({
        keyword: k.keyword,
        rank: k.rank,
        category: k.category_1,
      })),
    });
  } catch (error: any) {
    console.error('[API /related-keywords] ❌ 오류:', error);
    return NextResponse.json(
      { error: '관련 검색어 조회에 실패했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

