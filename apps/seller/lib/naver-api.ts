/**
 * 네이버 커머스 API 클라이언트
 * 
 * 참고: https://developer.pay.naver.com/docs/v2/api
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

export class NaverApiClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(credentials: NaverApiCredentials) {
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
  }

  /**
   * Access Token 발급
   */
  private async getAccessToken(): Promise<string> {
    // 토큰이 유효하면 재사용
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://api.commerce.naver.com/external/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          type: 'SELF',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get access token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // 토큰 만료 시간 설정 (발급 시간 + 유효기간 - 1분 여유)
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Get access token error:', error);
      throw new Error('네이버 API 인증에 실패했습니다.');
    }
  }

  /**
   * 상품 목록 조회
   */
  async getProducts(page: number = 1, size: number = 100): Promise<NaverProductListResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `https://api.commerce.naver.com/external/v2/products?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch products');
      }

      const data = await response.json();

      return {
        products: data.contents || [],
        totalCount: data.totalElements || 0,
      };
    } catch (error) {
      console.error('Get products error:', error);
      throw new Error('상품 목록 조회에 실패했습니다.');
    }
  }

  /**
   * 상품 상세 조회
   */
  async getProduct(productId: string): Promise<NaverProduct | null> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `https://api.commerce.naver.com/external/v2/products/${productId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch product');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get product error:', error);
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
export function transformNaverProduct(naverProduct: NaverProduct): {
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  stockQuantity?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  categoryPath?: string;
  naverProductId: string;
  naverProductNo?: string;
} {
  // 카테고리 파싱
  const categories = naverProduct.category?.wholeCategoryName?.split('>').map(c => c.trim()) || [];

  return {
    name: naverProduct.name,
    description: naverProduct.detailAttribute?.productInfoProvidedNotice?.productInfoProvidedNoticeType,
    price: naverProduct.salePrice,
    salePrice: naverProduct.salePrice, // 네이버에서 할인가 정보가 별도로 있다면 수정 필요
    stockQuantity: naverProduct.stockQuantity,
    imageUrl: naverProduct.images?.[0],
    thumbnailUrl: naverProduct.images?.[0],
    category1: categories[0],
    category2: categories[1],
    category3: categories[2],
    categoryPath: categories.join(' > '),
    naverProductId: naverProduct.id,
    naverProductNo: naverProduct.id,
  };
}

