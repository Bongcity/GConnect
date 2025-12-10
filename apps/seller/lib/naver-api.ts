/**
 * 네이버 커머스 API 클라이언트
 * 
 * 참고: https://apicenter.commerce.naver.com/docs/introduction
 */

export interface NaverApiCredentials {
  clientId: string;
  clientSecret: string;
}

export interface NaverProduct {
  id: string;
  name: string;
  salePrice: number;
  stockQuantity: number;
  images?: string[];
  category: {
    wholeCategoryId: string;
    wholeCategoryName: string;
  };
  detailAttribute?: {
    productInfoProvidedNotice?: {
      productInfoProvidedNoticeType?: string;
    };
  };
  status: string;
}

export interface NaverProductListResponse {
  products: NaverProduct[];
  totalCount: number;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class NaverApiClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(credentials: NaverApiCredentials) {
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
  }

  /**
   * OAuth 2.0 액세스 토큰 발급
   */
  private async getAccessToken(): Promise<string> {
    // 토큰이 유효하면 재사용
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // bcrypt 전자서명 생성
      const bcrypt = await import('bcryptjs');
      const timestamp = Date.now().toString();
      const password = `${this.clientId}_${timestamp}`;
      
      // bcrypt 해싱 (salt로 client_secret 사용)
      const hashed = bcrypt.hashSync(password, this.clientSecret);
      
      // Base64 인코딩
      const clientSecretSign = Buffer.from(hashed).toString('base64');
      
      const response = await fetch(
        'https://api.commerce.naver.com/external/v1/oauth2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: this.clientId,
            timestamp: timestamp,
            client_secret_sign: clientSecretSign,
            grant_type: 'client_credentials',
            type: 'SELF',
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        console.error('OAuth token error:', response.status, errorData);
        throw new Error(errorData.message || `토큰 발급 실패 (${response.status})`);
      }

      const data: TokenResponse = await response.json();
      this.accessToken = data.access_token;
      // 만료 시간 5분 전으로 설정 (안전 마진)
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
      
      return this.accessToken;
    } catch (error) {
      console.error('Get access token error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('액세스 토큰 발급에 실패했습니다.');
    }
  }

  /**
   * OAuth 2.0 Bearer 토큰 방식의 공통 헤더 생성
   */
  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * 상품 목록 조회 (POST /v1/products/search)
   * 네이버 커머스 API 공식 엔드포인트 사용
   */
  async getProducts(page: number = 1, size: number = 100): Promise<NaverProductListResponse> {
    try {
      const headers = await this.getHeaders();
      
      console.log(`[NaverAPI] 상품 조회: POST /v1/products/search (page=${page}, size=${size})`);
      
      const response = await fetch(
        `https://api.commerce.naver.com/external/v1/products/search`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            searchCondition: {
              productStatus: 'ON_SALE', // 판매중인 상품만
            },
            paging: {
              page: page,
              size: size,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        console.error('[NaverAPI] 상품 조회 실패:', response.status, errorData);
        throw new Error(errorData.message || `API 호출 실패 (${response.status})`);
      }

      const data = await response.json();
      
      const totalCount = data.totalCount || data.totalElements || 0;
      const products = data.products || data.contents || [];
      
      console.log(`[NaverAPI] 상품 조회 성공: totalCount=${totalCount}, products=${products.length}개`);

      return {
        products: products,
        totalCount: totalCount,
      };
    } catch (error) {
      console.error('[NaverAPI] Get products error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('상품 목록 조회에 실패했습니다.');
    }
  }

  /**
   * 상품 상세 조회
   */
  async getProduct(productId: string): Promise<NaverProduct | null> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(
        `https://api.commerce.naver.com/external/v1/products/${productId}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `API 호출 실패 (${response.status})`);
      }

      const data = await response.json();
      return data.product || data;
    } catch (error) {
      console.error('Get product error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('상품 조회에 실패했습니다.');
    }
  }

  /**
   * 채널 상품 상세 조회 (GET /v2/products/channel-products/{channelProductNo})
   * 스토어 정보, 수수료율, 추가 이미지 등 상세 정보 포함
   */
  async getChannelProductDetail(channelProductNo: string): Promise<any | null> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(
        `https://api.commerce.naver.com/external/v2/products/channel-products/${channelProductNo}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`[NaverAPI] 상품 상세 조회 실패 (404): channelProductNo=${channelProductNo}`);
          return null;
        }
        if (response.status === 429) {
          console.warn(`[NaverAPI] 상품 상세 조회 실패 (429): 요청이 많아 서비스를 일시적으로 사용할 수 없습니다.`);
          return null;
        }
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        console.error(`[NaverAPI] 상품 상세 조회 실패 (${response.status}):`, errorData);
        return null; // 에러 발생 시 null 반환 (동기화 중단 방지)
      }

      const data = await response.json();
      
      // ✅ 네이버 API 응답 구조: { originProduct: {...}, smartstoreChannelProduct: {...} }
      const detailProduct = data;
      
      // 🔍 상세 API 응답 구조 로깅 (처음 1개만)
      // @ts-ignore
      if (typeof this.detailLogged === 'undefined') {
        console.log('\n============ 네이버 상세 API 응답 샘플 ============');
        console.log('📦 originProduct 존재:', !!data.originProduct);
        console.log('📦 smartstoreChannelProduct 존재:', !!data.smartstoreChannelProduct);
        
        if (data.originProduct) {
          console.log('\n✅ originProduct.images.optionalImages 개수:', data.originProduct.images?.optionalImages?.length || 0);
          if (data.originProduct.images?.optionalImages?.[0]) {
            console.log('   샘플 이미지 URL:', data.originProduct.images.optionalImages[0].url);
          }
          console.log('✅ originProduct.detailContent:', data.originProduct.detailContent ? `exists (${data.originProduct.detailContent.length} chars)` : 'undefined');
        }
        
        console.log('\n❌ 제공되지 않는 필드들: sellerCustomerNo, storeName, brandType, commissionRate 등');
        console.log('=================================================\n');
        // @ts-ignore
        this.detailLogged = true;
      }
      
      return detailProduct;
    } catch (error) {
      console.error('[NaverAPI] Get channel product detail error:', error);
      return null; // 에러 발생 시 null 반환
    }
  }

  /**
   * 여러 페이지의 상품을 한번에 가져오기
   */
  async getAllProducts(maxPages: number = 10): Promise<NaverProduct[]> {
    const allProducts: NaverProduct[] = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore && currentPage <= maxPages) {
      try {
        const result = await this.getProducts(currentPage, 100);
        allProducts.push(...result.products);

        // 더 이상 상품이 없으면 종료
        if (result.products.length === 0 || allProducts.length >= result.totalCount) {
          hasMore = false;
        }

        currentPage++;
      } catch (error) {
        console.error(`Failed to fetch page ${currentPage}:`, error);
        hasMore = false;
      }
    }

    return allProducts;
  }
}

/**
 * 네이버 상품 상세 정보 타입
 */
export interface ProductDetail {
  originProductNo: number;
  channelProductNo: number;
  statusType: string;
  displayStatus: string;
  originalPrice: number;
  discountRate: number;
  mobileDiscountedPrice: number;
  deliveryAttributeType: string;
  deliveryFee: number;
  returnFee: number;
  exchangeFee: number;
  sellerPurchasePoint: number;
  sellerPurchasePointUnit: string;
  managerPurchasePoint: number;
  textReviewPoint: number;
  photoVideoReviewPoint: number;
  regularCustomerPoint: number;
  freeInterest: number;
  gift: string;
  categoryId: string;
  wholeCategoryId: string;
  wholeCategoryName: string;
  knowledgeShoppingRegistration: boolean;
  brandName?: string;
  manufacturerName?: string;
}

/**
 * 변환된 상품 정보 타입
 */
export interface TransformedProduct {
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  stockQuantity?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  productUrl?: string;
  naverProductId: string;
  naverProductNo?: string;
  categoryPath?: string;
  
  // affiliate_products 테이블 추가 필드
  storeId?: string;                    // 상점 ID
  storeName?: string;                  // 상점명
  brandStore?: boolean;                // 브랜드 스토어 여부
  discountedRate?: number;             // 할인율 (%)
  commissionRate?: number;             // 수수료율
  promotionCommissionRate?: number;    // 프로모션 수수료율
  otherImageUrls?: string[];           // 추가 이미지 배열
  descriptionUrl?: string;             // 상세 설명 URL
  promotionJson?: string;              // 프로모션 정보 (JSON)
  
  detail?: ProductDetail;
}

/**
 * 네이버 상품 데이터를 내부 형식으로 변환
 * 네이버 API는 originProductNo와 channelProducts 배열을 반환
 * 실제 상품 정보는 channelProducts[0] 안에 있음
 * 
 * @param naverProduct - 네이버 API 상품 데이터
 * @param detailData - 선택적 상세 정보 (v2 API에서 조회)
 */
export function transformNaverProduct(naverProduct: any, detailData?: any): TransformedProduct {
  // @ts-ignore - 로깅용 정적 변수
  if (typeof transformNaverProduct.logged === 'undefined') {
    // @ts-ignore
    transformNaverProduct.logged = false;
  }
  // 🔍 네이버 API 원본 데이터 로그 (처음 1개만)
  // @ts-ignore
  if (!transformNaverProduct.logged) {
    console.log('=== 네이버 API 원본 응답 샘플 ===');
    console.log('naverProduct 전체:', JSON.stringify(naverProduct, null, 2));
    // @ts-ignore
    transformNaverProduct.logged = true;
  }
  
  // channelProducts 배열에서 첫 번째 상품 정보 추출
  const channelProduct = naverProduct.channelProducts?.[0];
  
  if (!channelProduct) {
    console.warn('[Transform] channelProducts가 없습니다:', naverProduct);
    return {
      name: '상품명 없음',
      price: 0,
      salePrice: 0,
      naverProductId: naverProduct.originProductNo?.toString() || `UNKNOWN_${Date.now()}`,
      naverProductNo: naverProduct.originProductNo?.toString(),
    };
  }
  
  console.log('=== channelProduct 샘플 ===');
  console.log('channelProduct 전체:', JSON.stringify(channelProduct, null, 2));

  // 상품명
  const productName = channelProduct.name || '상품명 없음';

  // 가격 (할인가가 있으면 할인가, 없으면 원가)
  const salePrice = channelProduct.discountedPrice || channelProduct.salePrice || 0;

  // 재고
  const stockQuantity = channelProduct.stockQuantity;

  // 이미지 URL
  const imageUrl = channelProduct.representativeImage?.url;

  // 카테고리
  const wholeCategoryName = channelProduct.wholeCategoryName;

  // 상품 URL 구성 (channelProductNo 사용)
  const productUrl = channelProduct.channelProductNo 
    ? `https://smartstore.naver.com/product/${channelProduct.channelProductNo}`
    : undefined;

  // 할인율 계산 (affiliate_products.discounted_rate에 저장)
  const originalPrice = channelProduct.salePrice || 0;
  const discountedPrice = channelProduct.discountedPrice || channelProduct.salePrice || 0;
  const discountRate = originalPrice > 0 && discountedPrice < originalPrice
    ? parseFloat(((originalPrice - discountedPrice) / originalPrice * 100).toFixed(2))
    : 0;
  
  console.log('💸 가격/할인율 정보:', { 
    originalPrice, 
    discountedPrice, 
    discountRate: `${discountRate}%`,
    '원본필드들': {
      'channelProduct.salePrice': channelProduct.salePrice,
      'channelProduct.discountedPrice': channelProduct.discountedPrice,
    }
  });
  
  // 스토어 정보 추출 (상세 정보 우선)
  // ❌ 네이버 API에서 sellerCustomerNo, sellerName 필드를 제공하지 않음
  // ⚠️  현재는 brandName만 사용 가능 (channelProduct.brandName)
  const storeId = detailData?.originProduct?.sellerCustomerNo?.toString()
    || detailData?.originProduct?.sellerNo?.toString()
    || naverProduct.sellerCustomerNo?.toString() 
    || channelProduct.sellerCustomerNo?.toString()
    || naverProduct.sellerNo?.toString()
    || channelProduct.sellerNo?.toString();
  
  const storeName = detailData?.originProduct?.sellerName
    || detailData?.originProduct?.storeName
    || naverProduct.sellerName 
    || channelProduct.sellerName
    || naverProduct.storeName
    || channelProduct.storeName
    || channelProduct.brandName; // ✅ brandName은 제공됨
  
  const brandStore = detailData?.originProduct?.brandType === 'BRAND'
    || detailData?.originProduct?.isBrand === true
    || detailData?.originProduct?.isBrandStore === true
    || channelProduct.brandType === 'BRAND' 
    || channelProduct.isBrand === true
    || channelProduct.isBrandStore === true;
  
  console.log('🏪 스토어 정보:', { 
    storeId, 
    storeName, 
    brandStore,
    'detailData 사용': !!detailData?.originProduct,
    '원본필드들': {
      'detailData?.originProduct?.sellerCustomerNo': detailData?.originProduct?.sellerCustomerNo,
      'detailData?.originProduct?.sellerName': detailData?.originProduct?.sellerName,
      'detailData?.originProduct?.brandType': detailData?.originProduct?.brandType,
      'channelProduct.brandName': channelProduct.brandName,
    }
  });
  
  // 추가 이미지 배열 처리 (상세 정보 우선)
  // ✅ 네이버 상세 API 응답 구조: detailData.originProduct.images.optionalImages[]
  const otherImages: string[] = [];
  const imageSources = detailData?.originProduct?.images?.optionalImages || channelProduct.images;
  if (imageSources && Array.isArray(imageSources)) {
    imageSources.forEach((img: any) => {
      const imgUrl = img.url || img.imageUrl;
      if (imgUrl && imgUrl !== imageUrl) { // 대표 이미지 제외
        otherImages.push(imgUrl);
      }
    });
  }
  
  console.log('📸 추가 이미지:', { 
    count: otherImages.length, 
    images: otherImages.slice(0, 2),
    'detailData 사용': !!detailData?.originProduct?.images?.optionalImages,
    '원본 images 필드': imageSources?.length || 0
  });
  
  // 상세 설명 URL
  // ❌ detailData.originProduct.detailContent는 HTML이지 URL이 아님
  // ✅ 기본 URL 구성: https://smartstore.naver.com/{channelProductNo}/detail
  const descriptionUrl = channelProduct.detailContent?.url 
    || channelProduct.detailContentUrl
    || channelProduct.pcDetailContent?.url
    || (channelProduct.channelProductNo 
      ? `https://smartstore.naver.com/${channelProduct.channelProductNo}/detail`
      : undefined);
  
  console.log('📝 상세 URL:', { 
    descriptionUrl,
    'HTML detailContent 존재': !!detailData?.originProduct?.detailContent,
    '원본필드들': {
      'channelProduct.detailContent?.url': channelProduct.detailContent?.url,
    }
  });
  
  // 수수료 정보 (상세 정보 우선)
  // ❌ 네이버 API에서 commissionRate, promotionCommissionRate 필드를 제공하지 않음
  const commissionRate = detailData?.originProduct?.commissionRate
    || channelProduct.commissionRate 
    || naverProduct.commissionRate
    || 0;
  
  const promotionCommissionRate = detailData?.originProduct?.promotionCommissionRate
    || channelProduct.promotionCommissionRate 
    || naverProduct.promotionCommissionRate
    || 0;
  
  console.log('💰 수수료 정보:', { 
    commissionRate, 
    promotionCommissionRate,
    'detailData 사용': !!detailData?.originProduct,
    '원본필드들': {
      'detailData?.originProduct?.commissionRate': detailData?.originProduct?.commissionRate,
      'detailData?.originProduct?.promotionCommissionRate': detailData?.originProduct?.promotionCommissionRate,
      'channelProduct.commissionRate': channelProduct.commissionRate,
    }
  });
  
  // 프로모션 정보 JSON 변환 (상세 정보 우선)
  // ❌ 네이버 API에서 promotions 필드를 제공하지 않음
  const promotions = detailData?.originProduct?.promotions 
    || channelProduct.promotions 
    || naverProduct.promotions 
    || [];
  const promotionJson = promotions.length > 0 ? JSON.stringify(promotions) : null;
  
  console.log('🎁 프로모션 정보:', { 
    promotionCount: promotions.length,
    promotionJson: promotionJson?.substring(0, 100),
    'detailData 사용': !!detailData?.originProduct,
    '원본필드들': {
      'detailData?.originProduct?.promotions': detailData?.originProduct?.promotions?.length || 0,
      'channelProduct.promotions': channelProduct.promotions?.length || 0,
    }
  });

  // 상세 정보 추출 (discount_rate 제거 - affiliate_products.discounted_rate 사용)
  const detail: ProductDetail = {
    originProductNo: naverProduct.originProductNo || 0,
    channelProductNo: channelProduct.channelProductNo || 0,
    statusType: channelProduct.statusType || '',
    displayStatus: channelProduct.channelProductDisplayStatusType || '',
    originalPrice: originalPrice,
    discountRate: 0, // deprecated - affiliate_products.discounted_rate 사용
    mobileDiscountedPrice: channelProduct.mobileDiscountedPrice || discountedPrice,
    deliveryAttributeType: channelProduct.deliveryAttributeType || '',
    deliveryFee: channelProduct.deliveryFee || 0,
    returnFee: channelProduct.returnFee || 0,
    exchangeFee: channelProduct.exchangeFee || 0,
    sellerPurchasePoint: channelProduct.sellerPurchasePoint || 0,
    sellerPurchasePointUnit: channelProduct.sellerPurchasePointUnitType || '',
    managerPurchasePoint: channelProduct.managerPurchasePoint || 0,
    textReviewPoint: channelProduct.textReviewPoint || 0,
    photoVideoReviewPoint: channelProduct.photoVideoReviewPoint || 0,
    regularCustomerPoint: channelProduct.regularCustomerPoint || 0,
    freeInterest: channelProduct.freeInterest || 0,
    gift: channelProduct.gift || '',
    categoryId: channelProduct.categoryId || '',
    wholeCategoryId: channelProduct.wholeCategoryId || '',
    wholeCategoryName: channelProduct.wholeCategoryName || '',
    knowledgeShoppingRegistration: channelProduct.knowledgeShoppingProductRegistration || false,
    brandName: channelProduct.brandName,
    manufacturerName: channelProduct.manufacturerName,
  };

  const result: TransformedProduct = {
    name: productName,
    description: channelProduct.description,
    price: salePrice,
    salePrice: salePrice,
    stockQuantity: stockQuantity,
    imageUrl: imageUrl,
    thumbnailUrl: imageUrl,
    productUrl: productUrl,
    categoryPath: wholeCategoryName,
    naverProductId: naverProduct.originProductNo?.toString() || `UNKNOWN_${Date.now()}`,
    naverProductNo: channelProduct.channelProductNo?.toString(),
    
    // affiliate_products 테이블 추가 필드
    storeId: storeId,
    storeName: storeName,
    brandStore: brandStore,
    discountedRate: discountRate,
    commissionRate: commissionRate > 0 ? commissionRate : undefined,
    promotionCommissionRate: promotionCommissionRate > 0 ? promotionCommissionRate : undefined,
    otherImageUrls: otherImages.length > 0 ? otherImages : undefined,
    descriptionUrl: descriptionUrl,
    promotionJson: promotionJson || undefined,
    
    detail: detail,
  };

  return result;
}

