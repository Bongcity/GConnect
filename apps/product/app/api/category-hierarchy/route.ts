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
    // SystemSettings 확인 - DDRo 상품 표시 여부
    const settings = await prisma.systemSettings.findFirst();
    if (!settings || !settings.showDdroProducts) {
      console.log('[API /category-hierarchy] ⚠️ DDRo 상품 표시 비활성화됨');
      return NextResponse.json({ categories: [] });
    }

    const { searchParams } = new URL(req.url);
    const category1 = searchParams.get('category1');
    const category2 = searchParams.get('category2');

    console.log(`[API /category-hierarchy] 조회: category1=${category1}, category2=${category2}`);

    // 1단계: 대분류만 조회 (대표 cid 포함)
    if (!category1) {
      const categories = await ddroPrisma.$queryRaw<
        Array<{
          category_1: string;
          cid: string;
          product_count: number;
        }>
      >`
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

      return NextResponse.json({
        level: 1,
        categories: categories.map(c => ({
          name: c.category_1,
          cid: c.cid,
          productCount: Number(c.product_count),
        })),
      });
    }

    // 2단계: 중분류 조회 (대표 cid 포함)
    if (category1 && !category2) {
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

