/**
 * 상품 통합 타입 시스템
 * 
 * SELLER 상품 (GCONNECT DB)과 GLOBAL 상품 (DDRo DB)를  
 * 하나의 인터페이스로 통합하여 사용
 * 
 * ⚠️ DDRo 기준 구조 적용 (snake_case → camelCase 변환)
 */

import type { Product, ProductDetail } from '@gconnect/db';
import type { AffiliateProduct } from '@gconnect/db';

// ============================================
// 상품 소스 구분
// ============================================

/**
 * 상품 출처
 * - SELLER: GCONNECT에 구독/결제한 파트너 스토어 상품
 * - GLOBAL: 네이버 스마트스토어 전체 상품 (DDRo DB)
 */
export type ProductSource = 'SELLER' | 'GLOBAL';

// ============================================
// 통합 상품 인터페이스 (UI용 camelCase)
// ============================================

/**
 * 통합 상품 타입
 * SELLER와 GLOBAL 상품을 하나의 형태로 표현
 * 
 * 📝 DDRo의 snake_case 구조를 camelCase로 변환하여 제공
 */
export interface UnifiedProduct {
  // 식별자
  id: string;
  source: ProductSource;
  
  // 상점 정보
  storeName: string | null;
  brandStore: boolean | null;
  storeStatus: string | null;
  
  // 상품 기본 정보
  productName: string;
  productStatus: string | null;
  
  // 가격 정보 (BigInt → number 변환)
  salePrice: number | null;
  discountedSalePrice: number | null;
  discountedRate: number | null;
  
  // 수수료 정보
  commissionRate: number | null;
  promotionCommissionRate: number | null;
  
  // 이미지 정보
  representativeProductImageUrl: string | null;
  otherProductImageUrls: string | null;
  
  // URL 정보
  productUrl: string | null;
  productDescriptionUrl: string | null;
  affiliateUrl: string | null;
  affiliateUrlId: number | null;
  affiliateUrlUpdatedAt: Date | null;
  
  // 프로모션 정보
  promotionJson: string | null;
  
  // 상태
  enabled: boolean | null;
  
  // 카테고리 정보
  sourceCategoryName: string | null;  // "category_1 > category_2 > category_3" 형식
  
  // 수집 메타 정보
  sourceKeyword: string | null;
  sourceCid: string | null;
  sourceRank: number | null;
  googleIn: number | null;
  
  // 타임스탬프
  createdAt: Date;
  updatedAt: Date;
  
  // SELLER 전용 (User 정보)
  userId?: string;
  
  // 상세 정보 (ProductDetail)
  detail?: {
    statusType: string | null;
    displayStatus: string | null;
    originalPrice: number | null;
    discountRate: number | null;
    mobileDiscountedPrice: number | null;
    deliveryAttributeType: string | null;
    deliveryFee: number | null;
    returnFee: number | null;
    exchangeFee: number | null;
    sellerPurchasePoint: number | null;
    sellerPurchasePointUnit: string | null;
    managerPurchasePoint: number | null;
    textReviewPoint: number | null;
    photoVideoReviewPoint: number | null;
    regularCustomerPoint: number | null;
    freeInterest: number | null;
    gift: string | null;
    wholeCategoryName: string | null;
    brandName: string | null;
    manufacturerName: string | null;
    knowledgeShoppingRegistration: boolean | null;
  };
}

// ============================================
// 변환 함수들
// ============================================

/**
 * SELLER 상품 (GCONNECT DB Product) → UnifiedProduct 변환
 * 
 * GCONNECT DB의 Products 테이블은 DDRo와 동일한 snake_case 구조를 사용
 */
export function transformSellerProduct(
  product: Product & { 
    user?: { shopName: string | null } | null;
    productDetail?: ProductDetail | null;
  }
): UnifiedProduct {
  const detail = product.productDetail;
  
  return {
    id: `SELLER_${product.id}`,
    source: 'SELLER',
    
    // 상점 정보
    storeName: product.store_name || detail?.brand_name || product.user?.shopName,
    brandStore: product.brand_store,
    storeStatus: product.store_status,
    
    // 상품 기본 정보
    productName: product.product_name || '상품명 없음',
    productStatus: product.product_status,
    
    // 가격 정보 (BigInt → number)
    salePrice: product.sale_price ? Number(product.sale_price) : null,
    discountedSalePrice: product.discounted_sale_price ? Number(product.discounted_sale_price) : null,
    discountedRate: product.discounted_rate,
    
    // 수수료 정보
    commissionRate: product.commission_rate,
    promotionCommissionRate: product.promotion_commission_rate,
    
    // 이미지 정보
    representativeProductImageUrl: product.representative_product_image_url,
    otherProductImageUrls: product.other_product_image_urls,
    
    // URL 정보
    productUrl: product.product_url,
    productDescriptionUrl: product.product_description_url,
    affiliateUrl: product.affiliate_url,
    affiliateUrlId: product.affiliate_url_id ? Number(product.affiliate_url_id) : null,
    affiliateUrlUpdatedAt: product.affiliate_url_updated_at,
    
    // 프로모션 정보
    promotionJson: product.promotion_json,
    
    // 상태
    enabled: product.enabled ?? true,
    
    // 카테고리 정보 (ProductDetail에서 가져오기)
    sourceCategoryName: detail?.whole_category_name || null,
    
    // 수집 메타 정보
    sourceKeyword: product.source_keyword,
    sourceCid: product.source_cid,
    sourceRank: product.source_rank,
    googleIn: product.google_in,
    
    // 타임스탬프
    createdAt: product.created_at || new Date(),
    updatedAt: product.updated_at || new Date(),
    
    // SELLER 전용
    userId: product.userId,
    
    // 상세 정보 (ProductDetail)
    detail: detail ? {
      statusType: detail.status_type,
      displayStatus: detail.display_status,
      originalPrice: detail.original_price ? Number(detail.original_price) : null,
      discountRate: detail.discount_rate,
      mobileDiscountedPrice: detail.mobile_discounted_price ? Number(detail.mobile_discounted_price) : null,
      deliveryAttributeType: detail.delivery_attribute_type,
      deliveryFee: detail.delivery_fee ? Number(detail.delivery_fee) : null,
      returnFee: detail.return_fee ? Number(detail.return_fee) : null,
      exchangeFee: detail.exchange_fee ? Number(detail.exchange_fee) : null,
      sellerPurchasePoint: detail.seller_purchase_point,
      sellerPurchasePointUnit: detail.seller_purchase_point_unit,
      managerPurchasePoint: detail.manager_purchase_point,
      textReviewPoint: detail.text_review_point,
      photoVideoReviewPoint: detail.photo_video_review_point,
      regularCustomerPoint: detail.regular_customer_point,
      freeInterest: detail.free_interest,
      gift: detail.gift,
      wholeCategoryName: detail.whole_category_name,
      brandName: detail.brand_name,
      manufacturerName: detail.manufacturer_name,
      knowledgeShoppingRegistration: detail.knowledge_shopping_registration,
    } : undefined,
  };
}

/**
 * GLOBAL 상품 (DDRo DB AffiliateProduct) → UnifiedProduct 변환
 */
export function transformGlobalProduct(
  product: AffiliateProduct & { source_category_name?: string | null }
): UnifiedProduct {
  return {
    id: `GLOBAL_${product.id}`,
    source: 'GLOBAL',
    
    // 상점 정보
    storeName: product.store_name,
    brandStore: product.brand_store,
    storeStatus: product.store_status,
    
    // 상품 기본 정보
    productName: product.product_name || '상품명 없음',
    productStatus: product.product_status,
    
    // 가격 정보 (BigInt → number)
    salePrice: product.sale_price ? Number(product.sale_price) : null,
    discountedSalePrice: product.discounted_sale_price ? Number(product.discounted_sale_price) : null,
    discountedRate: product.discounted_rate,
    
    // 수수료 정보
    commissionRate: product.commission_rate,
    promotionCommissionRate: product.promotion_commission_rate,
    
    // 이미지 정보
    representativeProductImageUrl: product.representative_product_image_url,
    otherProductImageUrls: product.other_product_image_urls,
    
    // URL 정보
    productUrl: product.product_url,
    productDescriptionUrl: product.product_description_url,
    affiliateUrl: product.affiliate_url,
    affiliateUrlId: product.affiliate_url_id ? Number(product.affiliate_url_id) : null,
    affiliateUrlUpdatedAt: product.affiliate_url_updated_at,
    
    // 프로모션 정보
    promotionJson: product.promotion_json,
    
    // 상태
    enabled: product.enabled ?? true,
    
    // 카테고리 정보
    sourceCategoryName: product.source_category_name || null,
    
    // 수집 메타 정보
    sourceKeyword: product.source_keyword,
    sourceCid: product.source_cid,
    sourceRank: product.source_rank,
    googleIn: product.google_in,
    
    // 타임스탬프
    createdAt: product.created_at || new Date(),
    updatedAt: product.updated_at || new Date(),
  };
}

// ============================================
// 쿼리 옵션
// ============================================

export interface ProductQueryOptions {
  /** 검색 키워드 (상품명에서 검색) */
  keyword?: string;
  
  /** 카테고리 필터 (source_cid 기준) */
  category?: string;
  
  /** 페이지 번호 (1부터 시작) */
  page?: number;
  
  /** 페이지당 상품 수 (기본값: 40) */
  pageSize?: number;
  
  /** 정렬 기준 */
  sortBy?: 'latest' | 'priceAsc' | 'priceDesc';
}
