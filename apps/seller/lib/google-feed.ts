/**
 * Google Shopping Feed Generator
 * 
 * Google Merchant Center용 XML 피드 생성
 * RSS 2.0 + Google Shopping 확장 스키마 사용
 * 
 * 참고: https://support.google.com/merchants/answer/7052112
 */

export interface FeedProduct {
  id: string;
  title: string;
  description?: string;
  link: string;
  imageLink?: string;
  price: number;
  availability: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  condition: 'new' | 'refurbished' | 'used';
  googleProductCategory?: string;
  productType?: string;
  gtin?: string;
  mpn?: string;
}

export interface FeedConfig {
  title: string;
  description: string;
  link: string;
  language?: string;
  currency?: string;
}

/**
 * XML 이스케이프 처리
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * CDATA 섹션으로 감싸기
 */
function cdata(text: string): string {
  return `<![CDATA[${text}]]>`;
}

/**
 * Google Shopping Feed XML 생성
 */
export function generateGoogleShoppingFeed(
  config: FeedConfig,
  products: FeedProduct[]
): string {
  const language = config.language || 'ko';
  const currency = config.currency || 'KRW';
  const now = new Date().toUTCString();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
  xml += '  <channel>\n';
  
  // 채널 정보
  xml += `    <title>${cdata(config.title)}</title>\n`;
  xml += `    <link>${escapeXml(config.link)}</link>\n`;
  xml += `    <description>${cdata(config.description)}</description>\n`;
  xml += `    <language>${language}</language>\n`;
  xml += `    <lastBuildDate>${now}</lastBuildDate>\n`;

  // 상품 아이템
  for (const product of products) {
    xml += '    <item>\n';
    
    // 필수 필드
    xml += `      <g:id>${escapeXml(product.id)}</g:id>\n`;
    xml += `      <g:title>${cdata(product.title)}</g:title>\n`;
    
    if (product.description) {
      xml += `      <g:description>${cdata(product.description)}</g:description>\n`;
    }
    
    xml += `      <g:link>${escapeXml(product.link)}</g:link>\n`;
    
    if (product.imageLink) {
      xml += `      <g:image_link>${escapeXml(product.imageLink)}</g:image_link>\n`;
    }
    
    xml += `      <g:price>${product.price} ${currency}</g:price>\n`;
    xml += `      <g:availability>${product.availability}</g:availability>\n`;
    xml += `      <g:condition>${product.condition}</g:condition>\n`;

    // 선택 필드
    if (product.brand) {
      xml += `      <g:brand>${cdata(product.brand)}</g:brand>\n`;
    }
    
    if (product.googleProductCategory) {
      xml += `      <g:google_product_category>${cdata(product.googleProductCategory)}</g:google_product_category>\n`;
    }
    
    if (product.productType) {
      xml += `      <g:product_type>${cdata(product.productType)}</g:product_type>\n`;
    }
    
    if (product.gtin) {
      xml += `      <g:gtin>${escapeXml(product.gtin)}</g:gtin>\n`;
    }
    
    if (product.mpn) {
      xml += `      <g:mpn>${escapeXml(product.mpn)}</g:mpn>\n`;
    }

    xml += '    </item>\n';
  }

  xml += '  </channel>\n';
  xml += '</rss>';

  return xml;
}

/**
 * Product 데이터를 FeedProduct로 변환
 */
export function productToFeedProduct(
  product: any,
  baseUrl: string
): FeedProduct {
  const productUrl = `${baseUrl}/products/${product.id}`;
  
  return {
    id: product.id,
    title: product.name.substring(0, 150), // Google: 최대 150자
    description: product.description?.substring(0, 5000) || product.name, // Google: 최대 5000자
    link: productUrl,
    imageLink: product.imageUrl || undefined,
    price: Number(product.salePrice || product.price),
    availability: getAvailability(product),
    brand: '네이버 스마트스토어', // 기본값, 추후 상품별로 설정 가능
    condition: 'new',
    googleProductCategory: mapCategory(product.category1),
    productType: product.categoryPath || product.category1,
    gtin: undefined, // GTIN이 있다면 추가
    mpn: product.naverProductId || undefined,
  };
}

/**
 * 재고 상태 결정
 */
function getAvailability(product: any): 'in stock' | 'out of stock' | 'preorder' {
  if (!product.isActive) {
    return 'out of stock';
  }
  
  if (product.stockQuantity !== null && product.stockQuantity !== undefined) {
    return product.stockQuantity > 0 ? 'in stock' : 'out of stock';
  }
  
  return 'in stock'; // 재고 정보가 없으면 판매 중으로 간주
}

/**
 * 카테고리 매핑 (간단한 예시)
 * 실제로는 네이버 카테고리 → Google 카테고리 매핑 테이블 필요
 */
function mapCategory(category?: string): string | undefined {
  if (!category) return undefined;
  
  // Google Product Taxonomy 예시
  const categoryMap: Record<string, string> = {
    '전자기기': 'Electronics',
    '패션': 'Apparel & Accessories',
    '생활용품': 'Home & Garden',
    '가구/인테리어': 'Furniture',
    '식품': 'Food, Beverages & Tobacco',
  };
  
  return categoryMap[category] || undefined;
}


