/**
 * 네이버 카테고리 파싱 및 관리 유틸리티
 */

import { prisma } from '@gconnect/db';

/**
 * 네이버 카테고리 경로를 파싱하여 개별 카테고리로 분리
 * 
 * @example
 * parseNaverCategory(
 *   "가구/인테리어>DIY자재/용품>리모델링>싱크대",
 *   "50000004>50000107>50008168>50008228"
 * )
 * // => {
 * //   category_1: "가구/인테리어",
 * //   category_2: "DIY자재/용품",
 * //   category_3: "리모델링",
 * //   cid: "50008228"
 * // }
 */
export function parseNaverCategory(
  wholeCategoryName: string | null | undefined,
  wholeCategoryId: string | null | undefined
): {
  category_1: string | null;
  category_2: string | null;
  category_3: string | null;
  cid: string | null;
} {
  if (!wholeCategoryName || !wholeCategoryId) {
    return {
      category_1: null,
      category_2: null,
      category_3: null,
      cid: null,
    };
  }

  // "가구/인테리어>DIY자재/용품>리모델링>싱크대" 형식 파싱
  const categories = wholeCategoryName.split('>').map(c => c.trim());
  
  // "50000004>50000107>50008168>50008228" 형식 파싱
  const categoryIds = wholeCategoryId.split('>').map(c => c.trim());
  
  return {
    category_1: categories[0] || null,
    category_2: categories[1] || null,
    category_3: categories[2] || null,
    cid: categoryIds[categoryIds.length - 1] || null, // 마지막 카테고리 ID (가장 구체적인 카테고리)
  };
}

/**
 * 네이버 카테고리를 NaverCategories 테이블에 생성 또는 업데이트
 * 이미 존재하면 기존 레코드 반환, 없으면 새로 생성
 * 
 * @param category_1 대분류 (예: "가구/인테리어")
 * @param category_2 중분류 (예: "DIY자재/용품")
 * @param category_3 소분류 (예: "리모델링")
 * @param cid 네이버 카테고리 ID (예: "50008228")
 * @returns 생성되거나 찾은 NaverCategory 레코드
 */
export async function upsertNaverCategory(
  category_1: string | null,
  category_2: string | null,
  category_3: string | null,
  cid: string | null
) {
  // cid가 없으면 카테고리를 생성하지 않음
  if (!cid) {
    console.warn('[Category] cid가 없어 카테고리를 생성하지 않습니다.');
    return null;
  }
  
  try {
    // 기존 카테고리 확인
    const existing = await prisma.naverCategory.findFirst({
      where: { cid }
    });
    
    if (existing) {
      console.log(`[Category] 기존 카테고리 발견: ${cid} - ${category_1} > ${category_2} > ${category_3}`);
      return existing;
    }
    
    // 새 카테고리 생성
    console.log(`[Category] 새 카테고리 생성: ${cid} - ${category_1} > ${category_2} > ${category_3}`);
    const newCategory = await prisma.naverCategory.create({
      data: {
        category_1,
        category_2,
        category_3,
        cid,
      }
    });
    
    return newCategory;
  } catch (error) {
    console.error('[Category] 카테고리 upsert 실패:', error);
    // 에러가 발생해도 동기화는 계속 진행
    return null;
  }
}

/**
 * wholeCategoryName과 wholeCategoryId를 받아서 파싱하고 NaverCategories에 저장
 * 편의 함수: parseNaverCategory + upsertNaverCategory
 */
export async function processNaverCategory(
  wholeCategoryName: string | null | undefined,
  wholeCategoryId: string | null | undefined
) {
  const parsed = parseNaverCategory(wholeCategoryName, wholeCategoryId);
  return await upsertNaverCategory(
    parsed.category_1,
    parsed.category_2,
    parsed.category_3,
    parsed.cid
  );
}

