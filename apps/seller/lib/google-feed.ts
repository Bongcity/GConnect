/**
 * Google Shopping Feed Generator
 * 
 * Google Merchant Center??XML ?쇰뱶 ?앹꽦
 * RSS 2.0 + Google Shopping ?뺤옣 ?ㅽ궎留??ъ슜
 * 
 * 李멸퀬: https://support.google.com/merchants/answer/7052112
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
 * XML ?댁뒪耳?댄봽 泥섎━
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
 * CDATA ?뱀뀡?쇰줈 媛먯떥湲?
 */
function cdata(text: string): string {
  return `<![CDATA[${text}]]>`;
}

/**
 * Google Shopping Feed XML ?앹꽦
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
  
  // 梨꾨꼸 ?뺣낫
  xml += `    <title>${cdata(config.title)}</title>\n`;
  xml += `    <link>${escapeXml(config.link)}</link>\n`;
  xml += `    <description>${cdata(config.description)}</description>\n`;
  xml += `    <language>${language}</language>\n`;
  xml += `    <lastBuildDate>${now}</lastBuildDate>\n`;

  // ?곹뭹 ?꾩씠??
  for (const product of products) {
    xml += '    <item>\n';
    
    // ?꾩닔 ?꾨뱶
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

    // ?좏깮 ?꾨뱶
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
 * Product ?곗씠?곕? FeedProduct濡?蹂??
 */
export function productToFeedProduct(
  product: any,
  baseUrl: string
): FeedProduct {
  const productUrl = `${baseUrl}/products/${product.id}`;
  
  return {
    id: product.id,
    title: product.name.substring(0, 150), // Google: 理쒕? 150??
    description: product.description?.substring(0, 5000) || product.name, // Google: 理쒕? 5000??
    link: productUrl,
    imageLink: product.imageUrl || undefined,
    price: Number(product.salePrice || product.price),
    availability: getAvailability(product),
    brand: '?ㅼ씠踰??ㅻ쭏?몄뒪?좎뼱', // 湲곕낯媛? 異뷀썑 ?곹뭹蹂꾨줈 ?ㅼ젙 媛??
    condition: 'new',
    googleProductCategory: mapCategory(product.category1),
    productType: product.categoryPath || product.category1,
    gtin: undefined, // GTIN???덈떎硫?異붽?
    mpn: product.naverProductId || undefined,
  };
}

/**
 * ?ш퀬 ?곹깭 寃곗젙
 */
function getAvailability(product: any): 'in stock' | 'out of stock' | 'preorder' {
  if (!product.isActive) {
    return 'out of stock';
  }
  
  if (product.stockQuantity !== null && product.stockQuantity !== undefined) {
    return product.stockQuantity > 0 ? 'in stock' : 'out of stock';
  }
  
  return 'in stock'; // ?ш퀬 ?뺣낫媛 ?놁쑝硫??먮ℓ 以묒쑝濡?媛꾩＜
}

/**
 * 移댄뀒怨좊━ 留ㅽ븨 (媛꾨떒???덉떆)
 * ?ㅼ젣濡쒕뒗 ?ㅼ씠踰?移댄뀒怨좊━ ??Google 移댄뀒怨좊━ 留ㅽ븨 ?뚯씠釉??꾩슂
 */
function mapCategory(category?: string): string | undefined {
  if (!category) return undefined;
  
  // Google Product Taxonomy ?덉떆
  const categoryMap: Record<string, string> = {
    '?꾩옄湲곌린': 'Electronics',
    '?⑥뀡': 'Apparel & Accessories',
    '?앺솢?⑺뭹': 'Home & Garden',
    '媛援??명뀒由ъ뼱': 'Furniture',
    '?앺뭹': 'Food, Beverages & Tobacco',
  };
  
  return categoryMap[category] || undefined;
}


