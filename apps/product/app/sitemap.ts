import { MetadataRoute } from 'next';
// import { getComposedProducts } from '@/lib/products';
// import { createProductUrl } from '@/lib/utils/slug';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_PRODUCT_URL || 'http://localhost:3002';

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 상품 페이지 동적 추가 (선택사항 - 활성화하려면 주석 해제)
  // 주의: 상품이 많을 경우 빌드 시간이 오래 걸릴 수 있습니다
  /*
  try {
    const { combined } = await getComposedProducts({ pageSize: 100 });
    const productPages: MetadataRoute.Sitemap = combined.map((product) => {
      const type = product.id.startsWith('GLOBAL_') ? 'GLOBAL' : 'SELLER';
      const numericId = product.id.replace(/^(GLOBAL_|SELLER_)/, '');
      const slug = createSlug(product.productName);
      
      return {
        url: `${baseUrl}/products/${type}/${numericId}/${slug}`,
        lastModified: product.updatedAt || product.createdAt || new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      };
    });
    
    return [...staticPages, ...productPages];
  } catch (error) {
    console.error('Failed to generate product sitemap:', error);
    return staticPages;
  }
  */

  return staticPages;
}
