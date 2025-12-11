import { NextRequest, NextResponse } from 'next/server';
import { ddroPrisma, prisma } from '@gconnect/db';

/**
 * 특정 카테고리 정보 조회 API
 * - cid로 카테고리명 조회
 */
export async function GET(req: NextRequest) {
  try {
    // SystemSettings 확인 - DDRo 상품 표시 여부
    const settings = await prisma.systemSettings.findFirst();
    if (!settings || !settings.showDdroProducts) {
      console.log('[API /category-info] ⚠️ DDRo 상품 표시 비활성화됨');
      return NextResponse.json({
        cid: null,
        name: '알 수 없음',
        category_1: null,
        category_2: null,
        category_3: null,
      });
    }

    const { searchParams } = new URL(req.url);
    const cid = searchParams.get('cid');

    if (!cid) {
      return NextResponse.json({ error: 'cid 파라미터가 필요합니다.' }, { status: 400 });
    }

    console.log(`[API /category-info] 카테고리 정보 조회: cid=${cid}`);

    // cid로 카테고리 조회
    const categories = await ddroPrisma.$queryRaw<
      Array<{
        category_1: string | null;
        category_2: string | null;
        category_3: string | null;
      }>
    >`
      SELECT TOP 1
        category_1,
        category_2,
        category_3
      FROM NaverCategories
      WHERE cid = ${cid}
    `;

    if (categories.length === 0) {
      // cid를 찾지 못한 경우에도 빈 객체 대신 기본값 반환
      console.log(`[API /category-info] ⚠️ cid를 찾을 수 없음: ${cid}`);
      return NextResponse.json({
        cid,
        name: '알 수 없음',
        category_1: null,
        category_2: null,
        category_3: null,
      });
    }

    const category = categories[0];
    
    // 카테고리 이름 생성 (대분류만 사용)
    const categoryName = category.category_1 || '알 수 없음';

    console.log(`[API /category-info] ✅ 카테고리: ${category.category_1} > ${category.category_2} > ${category.category_3}`);

    return NextResponse.json({
      cid,
      name: categoryName,
      category_1: category.category_1,
      category_2: category.category_2,
      category_3: category.category_3,
    });
  } catch (error: any) {
    console.error('[API /category-info] ❌ 오류:', error);
    return NextResponse.json(
      { error: '카테고리 정보 조회에 실패했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

