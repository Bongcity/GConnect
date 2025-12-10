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
 * 네이버 상품 데이터를 내부 형식으로 변환
 */
export function transformNaverProduct(naverProduct: any): {
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
} {
  console.log('[Transform] 원본 상품 데이터 키:', Object.keys(naverProduct));
  console.log('[Transform] 상품명 후보:', {
    name: naverProduct.name,
    productName: naverProduct.productName,
    originProductName: naverProduct.originProductName,
  });
  console.log('[Transform] 가격 후보:', {
    salePrice: naverProduct.salePrice,
    price: naverProduct.price,
    originPrice: naverProduct.originPrice,
  });

  // 다양한 필드명 시도
  const productName = 
    naverProduct.name || 
    naverProduct.productName || 
    naverProduct.originProductName || 
    '상품명 없음';

  const salePrice = 
    naverProduct.salePrice || 
    naverProduct.price || 
    naverProduct.originPrice || 
    0;

  const stockQuantity = 
    naverProduct.stockQuantity || 
    naverProduct.stock || 
    undefined;

  // 이미지 URL 추출 (여러 형식 지원)
  let imageUrl = undefined;
  if (naverProduct.representativeImage?.url) {
    imageUrl = naverProduct.representativeImage.url;
  } else if (naverProduct.images?.[0]?.url) {
    imageUrl = naverProduct.images[0].url;
  } else if (typeof naverProduct.images?.[0] === 'string') {
    imageUrl = naverProduct.images[0];
  } else if (naverProduct.imageUrl) {
    imageUrl = naverProduct.imageUrl;
  }

  const productId = 
    naverProduct.productNo?.toString() || 
    naverProduct.originProductNo?.toString() || 
    naverProduct.id?.toString() || 
    `UNKNOWN_${Date.now()}`;

  const result = {
    name: productName,
    description: naverProduct.productDescription || naverProduct.description,
    price: salePrice,
    salePrice: salePrice,
    stockQuantity: stockQuantity,
    imageUrl: imageUrl,
    thumbnailUrl: imageUrl,
    productUrl: naverProduct.productUrl || naverProduct.url,
    naverProductId: productId,
    naverProductNo: productId,
  };

  console.log('[Transform] 변환 결과:', result);
  return result;
}

