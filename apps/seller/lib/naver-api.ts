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

  constructor(credentials: NaverApiCredentials) {
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
  }

  /**
   * API Gateway 방식의 공통 헤더 생성
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-NCP-APIGW-API-KEY-ID': this.clientId,
      'X-NCP-APIGW-API-KEY': this.clientSecret,
    };
  }

  /**
   * 상품 목록 조회
   */
  async getProducts(page: number = 1, size: number = 100): Promise<NaverProductListResponse> {
    try {
      const response = await fetch(
        `https://api.commerce.naver.com/external/v1/products?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
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
        console.error('Naver API error:', response.status, errorData);
        throw new Error(errorData.message || `API 호출 실패 (${response.status})`);
      }

      const data = await response.json();

      return {
        products: data.products || data.contents || [],
        totalCount: data.totalCount || data.totalElements || 0,
      };
    } catch (error) {
      console.error('Get products error:', error);
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
      const response = await fetch(
        `https://api.commerce.naver.com/external/v1/products/${productId}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
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

