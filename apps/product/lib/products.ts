/**
 * 상품 조회 헬퍼 함수
 * 
 * SELLER 상품과 GLOBAL 상품을 통합 조회하여
 * SELLER 우선 노출 정책을 적용합니다.
 * 
 * 정책:
 * 1. SELLER 상품을 먼저 조회
 * 2. SELLER 상품이 pageSize보다 적으면 GLOBAL 상품으로 부족분 채우기
 * 3. SELLER가 pageSize 이상이면 SELLER만 반환
 * 
 * ⚠️ DDRo 기준 구조 적용 (snake_case)
 */

import { prisma, ddroPrisma } from '@gconnect/db';
import type { Product, GlobalAffiliateProduct } from '@gconnect/db';
import {
  transformSellerProduct,
  transformGlobalProduct,
  type UnifiedProduct,
  type ProductQueryOptions,
} from '@/types/product';

// ============================================
// 결과 타입 정의
// ============================================

export interface ComposedProductsResult {
  /** SELLER 상품 목록 */
  sellerProducts: UnifiedProduct[];
  
  /** GLOBAL 상품 목록 */
  globalProducts: UnifiedProduct[];
  
  /** SELLER + GLOBAL 통합 목록 (SELLER 우선) */
  combined: UnifiedProduct[];
  
  /** 전체 상품 개수 (SELLER + GLOBAL) */
  total: {
    seller: number;
    global: number;
    combined: number;
  };
  
  /** 페이지네이션 정보 */
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

// ============================================
// SELLER 상품 조회 (GCONNECT DB)
// ============================================

async function getSellerProducts(options: ProductQueryOptions): Promise<{
  products: (Product & { user: { shopName: string | null } | null })[];
  total: number;
}> {
  const { keyword, category, page = 1, pageSize = 40, sortBy = 'latest' } = options;
  
  try {
    console.log('[getSellerProducts] GCONNECT DB 연결 시도...');
    
    // WHERE 조건 구성
    const where: any = {
      enabled: true,
    };
    
    // 키워드 검색 (product_name 기준)
    if (keyword) {
      where.product_name = { contains: keyword };
    }
    
    // 카테고리 필터 (source_cid 기준)
    if (category) {
      where.source_cid = category;
    }
    
    // 정렬 조건
    let orderBy: any = { created_at: 'desc' };
    if (sortBy === 'priceAsc') {
      orderBy = { sale_price: 'asc' };
    } else if (sortBy === 'priceDesc') {
      orderBy = { sale_price: 'desc' };
    }
    
    // 병렬 실행: 데이터 조회 + 전체 개수 조회
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: {
          user: {
            select: {
              shopName: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);
    
    console.log(`[getSellerProducts] ✅ ${products.length}개 조회 완료`);
    return { products, total };
  } catch (error: any) {
    console.error('[getSellerProducts] ❌ 오류:', error.message);
    // 실제 DB 오류인 경우 빈 배열 반환 (Mock 대신)
    console.log('[getSellerProducts] 빈 배열 반환...');
    return { products: [], total: 0 };
  }
}

// ============================================
// GLOBAL 상품 조회 (DDRo DB)
// ============================================

async function getGlobalProducts(options: ProductQueryOptions): Promise<{
  products: GlobalAffiliateProduct[];
  total: number;
}> {
  // SystemSettings 확인 - DDRo 상품 표시 여부
  try {
    const settings = await prisma.systemSettings.findFirst();
    
    // 설정이 없거나 showDdroProducts가 false면 빈 배열 반환
    if (!settings || !settings.showDdroProducts) {
      console.log('[getGlobalProducts] ⚠️ DDRo 상품 표시 비활성화됨 (SystemSettings)');
      return { products: [], total: 0 };
    }
    
    console.log('[getGlobalProducts] ✅ DDRo 상품 표시 활성화됨');
  } catch (error) {
    console.error('[getGlobalProducts] ⚠️ SystemSettings 조회 실패:', error);
    // 설정 조회 실패 시 기본값으로 DDRo 상품 표시 (fail-safe)
  }

  const { keyword, category, page = 1, pageSize = 40, sortBy = 'latest' } = options;
  
  try {
    console.log('[getGlobalProducts] DDRo DB 연결 시도 (Raw SQL)...');
    
    const offset = (page - 1) * pageSize;
    
    // 쿼리 실행 - 정렬 조건별로 분기
    let products: GlobalAffiliateProduct[];
    let totalResult: { total: number }[];
    
    // 조건 없음 + 최신순
    if (!keyword && !category && sortBy === 'latest') {
      [products, totalResult] = await Promise.all([
        ddroPrisma.$queryRaw`
          SELECT 
            ap.*,
            CASE 
              WHEN nc.category_3 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2 + ' > ' + nc.category_3
              WHEN nc.category_2 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2
              WHEN nc.category_1 IS NOT NULL THEN nc.category_1
              ELSE NULL
            END as source_category_name
          FROM affiliate_products ap
          LEFT JOIN NaverCategories nc ON ap.source_cid = nc.cid
          WHERE ap.enabled = 1
          ORDER BY ap.created_at DESC
          OFFSET ${offset} ROWS
          FETCH NEXT ${pageSize} ROWS ONLY
        ` as Promise<GlobalAffiliateProduct[]>,
        ddroPrisma.$queryRaw`
          SELECT COUNT(*) as total
          FROM affiliate_products
          WHERE enabled = 1
        ` as Promise<{ total: number }[]>,
      ]);
    }
    // 조건 없음 + 낮은 가격순
    else if (!keyword && !category && sortBy === 'priceAsc') {
      [products, totalResult] = await Promise.all([
        ddroPrisma.$queryRaw`
          SELECT 
            ap.*,
            CASE 
              WHEN nc.category_3 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2 + ' > ' + nc.category_3
              WHEN nc.category_2 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2
              WHEN nc.category_1 IS NOT NULL THEN nc.category_1
              ELSE NULL
            END as source_category_name
          FROM affiliate_products ap
          LEFT JOIN NaverCategories nc ON ap.source_cid = nc.cid
          WHERE ap.enabled = 1
          ORDER BY ap.sale_price ASC
          OFFSET ${offset} ROWS
          FETCH NEXT ${pageSize} ROWS ONLY
        ` as Promise<GlobalAffiliateProduct[]>,
        ddroPrisma.$queryRaw`
          SELECT COUNT(*) as total
          FROM affiliate_products
          WHERE enabled = 1
        ` as Promise<{ total: number }[]>,
      ]);
    }
    // 조건 없음 + 높은 가격순
    else if (!keyword && !category && sortBy === 'priceDesc') {
      [products, totalResult] = await Promise.all([
        ddroPrisma.$queryRaw`
          SELECT 
            ap.*,
            CASE 
              WHEN nc.category_3 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2 + ' > ' + nc.category_3
              WHEN nc.category_2 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2
              WHEN nc.category_1 IS NOT NULL THEN nc.category_1
              ELSE NULL
            END as source_category_name
          FROM affiliate_products ap
          LEFT JOIN NaverCategories nc ON ap.source_cid = nc.cid
          WHERE ap.enabled = 1
          ORDER BY ap.sale_price DESC
          OFFSET ${offset} ROWS
          FETCH NEXT ${pageSize} ROWS ONLY
        ` as Promise<GlobalAffiliateProduct[]>,
        ddroPrisma.$queryRaw`
          SELECT COUNT(*) as total
          FROM affiliate_products
          WHERE enabled = 1
        ` as Promise<{ total: number }[]>,
      ]);
    }
    // 키워드만 + 최신순
    else if (keyword && !category && sortBy === 'latest') {
      const searchPattern = `%${keyword}%`;
      [products, totalResult] = await Promise.all([
        ddroPrisma.$queryRaw`
          SELECT 
            ap.*,
            CASE 
              WHEN nc.category_3 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2 + ' > ' + nc.category_3
              WHEN nc.category_2 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2
              WHEN nc.category_1 IS NOT NULL THEN nc.category_1
              ELSE NULL
            END as source_category_name
          FROM affiliate_products ap
          LEFT JOIN NaverCategories nc ON ap.source_cid = nc.cid
          WHERE ap.enabled = 1 AND ap.product_name LIKE ${searchPattern}
          ORDER BY ap.created_at DESC
          OFFSET ${offset} ROWS
          FETCH NEXT ${pageSize} ROWS ONLY
        ` as Promise<GlobalAffiliateProduct[]>,
        ddroPrisma.$queryRaw`
          SELECT COUNT(*) as total
          FROM affiliate_products
          WHERE enabled = 1 AND product_name LIKE ${searchPattern}
        ` as Promise<{ total: number }[]>,
      ]);
    }
    // 기타 조합은 기본 최신순으로 폴백
    else {
      const searchPattern = keyword ? `%${keyword}%` : '%';
      const hasKeyword = !!keyword;
      const hasCategory = !!category;
      
      if (hasKeyword && hasCategory) {
        [products, totalResult] = await Promise.all([
          ddroPrisma.$queryRaw`
            SELECT 
              ap.*,
              CASE 
                WHEN nc.category_3 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2 + ' > ' + nc.category_3
                WHEN nc.category_2 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2
                WHEN nc.category_1 IS NOT NULL THEN nc.category_1
                ELSE NULL
              END as source_category_name
            FROM affiliate_products ap
            LEFT JOIN NaverCategories nc ON ap.source_cid = nc.cid
            WHERE ap.enabled = 1 AND ap.product_name LIKE ${searchPattern} AND ap.source_cid = ${category}
            ORDER BY ap.created_at DESC
            OFFSET ${offset} ROWS
            FETCH NEXT ${pageSize} ROWS ONLY
          ` as Promise<GlobalAffiliateProduct[]>,
          ddroPrisma.$queryRaw`
            SELECT COUNT(*) as total
            FROM affiliate_products
            WHERE enabled = 1 AND product_name LIKE ${searchPattern} AND source_cid = ${category}
          ` as Promise<{ total: number }[]>,
        ]);
      } else if (hasCategory) {
        [products, totalResult] = await Promise.all([
          ddroPrisma.$queryRaw`
            SELECT 
              ap.*,
              CASE 
                WHEN nc.category_3 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2 + ' > ' + nc.category_3
                WHEN nc.category_2 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2
                WHEN nc.category_1 IS NOT NULL THEN nc.category_1
                ELSE NULL
              END as source_category_name
            FROM affiliate_products ap
            LEFT JOIN NaverCategories nc ON ap.source_cid = nc.cid
            WHERE ap.enabled = 1 AND ap.source_cid = ${category}
            ORDER BY ap.created_at DESC
            OFFSET ${offset} ROWS
            FETCH NEXT ${pageSize} ROWS ONLY
          ` as Promise<GlobalAffiliateProduct[]>,
          ddroPrisma.$queryRaw`
            SELECT COUNT(*) as total
            FROM affiliate_products
            WHERE enabled = 1 AND source_cid = ${category}
          ` as Promise<{ total: number }[]>,
        ]);
      } else {
        // 기본 폴백
        [products, totalResult] = await Promise.all([
          ddroPrisma.$queryRaw`
            SELECT 
              ap.*,
              CASE 
                WHEN nc.category_3 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2 + ' > ' + nc.category_3
                WHEN nc.category_2 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2
                WHEN nc.category_1 IS NOT NULL THEN nc.category_1
                ELSE NULL
              END as source_category_name
            FROM affiliate_products ap
            LEFT JOIN NaverCategories nc ON ap.source_cid = nc.cid
            WHERE ap.enabled = 1
            ORDER BY ap.created_at DESC
            OFFSET ${offset} ROWS
            FETCH NEXT ${pageSize} ROWS ONLY
          ` as Promise<GlobalAffiliateProduct[]>,
          ddroPrisma.$queryRaw`
            SELECT COUNT(*) as total
            FROM affiliate_products
            WHERE enabled = 1
          ` as Promise<{ total: number }[]>,
        ]);
      }
    }
    
    const total = totalResult[0]?.total || 0;
    
    console.log(`[getGlobalProducts] ✅ ${products.length}개 조회 완료 (전체: ${total}개)`);
    return { products, total };
  } catch (error: any) {
    console.error('[getGlobalProducts] ❌ 오류:', error.message);
    // Mock 데이터로 대체 (서비스 중단 방지)
    console.log('[getGlobalProducts] Mock GLOBAL 상품으로 대체...');
    const mockProducts = [
      {
        id: BigInt(101), affiliate_store_id: BigInt(9001), store_name: '네이버 스마트스토어', brand_store: null, store_status: null, product_name: 'Mock GLOBAL 프리미엄 아몬드 믹스 500g', product_status: 'ACTIVE', sale_price: BigInt(19900), discounted_sale_price: BigInt(17900), discounted_rate: 10.0, commission_rate: 3.5, promotion_commission_rate: null, representative_product_image_url: null, other_product_image_urls: null, product_url: '#', product_description_url: null, affiliate_url: null, affiliate_url_id: null, affiliate_url_updated_at: null, promotion_json: null, enabled: true, source_keyword: '아몬드', source_cid: '50000007', source_rank: 1, google_in: 1, created_at: new Date(), updated_at: new Date()
      },
      {
        id: BigInt(102), affiliate_store_id: BigInt(9001), store_name: '네이버 스마트스토어', brand_store: null, store_status: null, product_name: 'Mock GLOBAL 무선 충전 LED 스탠드', product_status: 'ACTIVE', sale_price: BigInt(35900), discounted_sale_price: BigInt(29900), discounted_rate: 17.0, commission_rate: 3.5, promotion_commission_rate: null, representative_product_image_url: null, other_product_image_urls: null, product_url: '#', product_description_url: null, affiliate_url: null, affiliate_url_id: null, affiliate_url_updated_at: null, promotion_json: null, enabled: true, source_keyword: 'LED 스탠드', source_cid: '50000008', source_rank: 2, google_in: 1, created_at: new Date(), updated_at: new Date()
      },
      {
        id: BigInt(103), affiliate_store_id: BigInt(9001), store_name: '네이버 스마트스토어', brand_store: null, store_status: null, product_name: 'Mock GLOBAL 메모리폼 목베개', product_status: 'ACTIVE', sale_price: BigInt(29000), discounted_sale_price: null, discounted_rate: 0.0, commission_rate: 3.5, promotion_commission_rate: null, representative_product_image_url: null, other_product_image_urls: null, product_url: '#', product_description_url: null, affiliate_url: null, affiliate_url_id: null, affiliate_url_updated_at: null, promotion_json: null, enabled: true, source_keyword: '메모리폼', source_cid: '50000009', source_rank: 3, google_in: 1, created_at: new Date(), updated_at: new Date()
      },
    ] as GlobalAffiliateProduct[];
    
    return { products: mockProducts, total: mockProducts.length };
  }
}

// ============================================
// 통합 상품 조회 (핵심 함수)
// ============================================

/**
 * SELLER와 GLOBAL 상품을 통합 조회
 * 
 * SELLER 우선 노출 정책:
 * - SELLER 상품이 pageSize보다 적으면 GLOBAL로 부족분 채움
 * - SELLER가 pageSize 이상이면 SELLER만 반환
 */
export async function getComposedProducts(
  options: ProductQueryOptions = {}
): Promise<ComposedProductsResult> {
  const { page = 1, pageSize = 40 } = options;
  
  console.log(`[getComposedProducts] 조회 시작: ${JSON.stringify(options)}`);

  // 1단계: SELLER와 GLOBAL 병렬 조회
  const [sellerResult, globalResult] = await Promise.all([
    getSellerProducts({ ...options, page, pageSize }),
    getGlobalProducts({ ...options, page, pageSize }),
  ]);
  
  console.log(`[getComposedProducts] SELLER: ${sellerResult.products.length}개, GLOBAL: ${globalResult.products.length}개`);

  // 2단계: SELLER 우선 배치 로직
  const sellerCount = sellerResult.products.length;
  const needGlobalCount = Math.max(0, pageSize - sellerCount);
  
  // SELLER 상품 변환
  const sellerProducts = sellerResult.products.map(transformSellerProduct);
  
  // GLOBAL 상품 변환 (필요한 만큼만)
  const globalProducts = globalResult.products
    .slice(0, needGlobalCount)
    .map(transformGlobalProduct);
  
  console.log(`[getComposedProducts] 변환 완료: SELLER ${sellerProducts.length}개, GLOBAL ${globalProducts.length}개`);

  // 3단계: SELLER + GLOBAL 통합 배열 생성
  const combined = [...sellerProducts, ...globalProducts];
  
  console.log(`[getComposedProducts] 통합 완료: 총 ${combined.length}개`);

  // 4단계: 결과 반환
  return {
    sellerProducts,
    globalProducts,
    combined,
    total: {
      seller: sellerResult.total,
      global: globalResult.total,
      combined: sellerResult.total + globalResult.total,
    },
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil((sellerResult.total + globalResult.total) / pageSize),
    },
  };
}

// ============================================
// 상품 상세 조회
// ============================================

/**
 * 상품 ID로 상세 정보 조회
 * ID 형식: "SELLER_{id}" 또는 "GLOBAL_{id}"
 */
export async function getProductById(id: string): Promise<UnifiedProduct | null> {
  try {
    if (id.startsWith('GLOBAL_')) {
      const numericId = parseInt(id.replace('GLOBAL_', ''));
      
      // NaverCategories와 JOIN하여 전체 카테고리 경로 가져오기
      const products = await ddroPrisma.$queryRaw`
        SELECT 
          ap.*,
          CASE 
            WHEN nc.category_3 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2 + ' > ' + nc.category_3
            WHEN nc.category_2 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2
            WHEN nc.category_1 IS NOT NULL THEN nc.category_1
            ELSE NULL
          END as source_category_name
        FROM affiliate_products ap
        LEFT JOIN NaverCategories nc ON ap.source_cid = nc.cid
        WHERE ap.id = ${numericId}
      ` as GlobalAffiliateProduct[];
      
      return products.length > 0 ? transformGlobalProduct(products[0]) : null;
    } else {
      // SELLER 상품 (SELLER_ 접두사 또는 순수 ID)
      const idString = id.startsWith('SELLER_') ? id.replace('SELLER_', '') : id;
      const numericId = parseInt(idString);
      
      // GLOBAL과 동일하게 NaverCategories와 JOIN하여 카테고리 경로 가져오기
      const products = await prisma.$queryRaw`
        SELECT 
          p.*,
          CASE 
            WHEN nc.category_3 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2 + ' > ' + nc.category_3
            WHEN nc.category_2 IS NOT NULL THEN nc.category_1 + ' > ' + nc.category_2
            WHEN nc.category_1 IS NOT NULL THEN nc.category_1
            ELSE NULL
          END as source_category_name
        FROM affiliate_products p
        LEFT JOIN NaverCategories nc ON p.source_cid = nc.cid
        WHERE p.id = ${BigInt(numericId)}
      ` as any[];
      
      if (products.length === 0) return null;
      
      const product = products[0];
      
      // ProductDetail과 User 정보를 별도로 조회
      // @ts-ignore - Prisma generate 후 자동 해결됨
      const productDetail = await prisma.productDetail.findUnique({
        where: { product_id: BigInt(numericId) },
      });
      
      const user = await prisma.user.findUnique({
        where: { id: product.userId },
        select: { shopName: true },
      });
      
      return transformSellerProduct({
        ...product,
        productDetail,
        user,
      });
    }
  } catch (error) {
    console.error('[getProductById] 오류:', error);
    return null;
  }
}

// ============================================
// 검색 전용 함수 (Backward Compatibility)
// ============================================

/**
 * 검색 결과 조회 (getComposedProducts의 래퍼)
 * SearchResults 컴포넌트와의 호환성을 위해 제공
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  sortBy: 'latest' | 'priceAsc' | 'priceDesc' = 'latest'
) {
  const result = await getComposedProducts({
    keyword: query,
    page,
    pageSize: 20,
    sortBy,
  });

  return {
    combined: result.combined,
    sellerCount: result.sellerProducts.length,
    globalCount: result.globalProducts.length,
    total: result.total.combined,
    hasNextPage: page < result.pagination.totalPages,
  };
}
