import type { UnifiedProduct } from '@/types/product';

/**
 * 상품명을 SEO 친화적인 slug로 변환
 * 
 * 예시:
 * - "친환경 대나무 칫솔 세트 (5개입)" -> "친환경-대나무-칫솔-세트-5개입"
 * - "미술학원 물감/휴대용" -> "미술학원-물감-휴대용"
 */
export function createSlug(productName: string): string {
  return productName
    .trim()
    // 공백, 괄호, 특수문자를 하이픈으로 변환
    .replace(/[\s\(\)\/\[\]{}.,!?]+/g, '-')
    // 연속된 하이픈을 하나로
    .replace(/-+/g, '-')
    // 앞뒤 하이픈 제거
    .replace(/^-|-$/g, '')
    // 최대 100자로 제한
    .substring(0, 100)
    // 마지막 문자가 하이픈이면 제거
    .replace(/-$/, '');
}

/**
 * UnifiedProduct로부터 완전한 상품 URL 생성
 * 
 * 형식: /products/{SELLER|GLOBAL}/{숫자ID}/{slug}
 * 예시: /products/GLOBAL/123456789/친환경-대나무-칫솔-세트-5개입
 */
export function createProductUrl(product: UnifiedProduct): string {
  // ID에서 타입과 숫자 ID 추출
  const type = product.id.startsWith('GLOBAL_') ? 'GLOBAL' : 'SELLER';
  const numericId = product.id.replace(/^(GLOBAL_|SELLER_)/, '');
  
  // Slug 생성
  const slug = createSlug(product.productName);
  
  return `/products/${type}/${numericId}/${slug}`;
}

/**
 * URL 파라미터로부터 전체 상품 ID 재구성
 * 
 * 예시: ('GLOBAL', '123456789') -> 'GLOBAL_123456789'
 */
export function reconstructProductId(type: string, numericId: string): string {
  const upperType = type.toUpperCase();
  return `${upperType}_${numericId}`;
}

