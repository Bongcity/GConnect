import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_PRODUCT_URL || 'https://www.gconnect.kr';

  // 정적 페이지 (항상 포함)
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

  // 상품 및 카테고리 페이지 동적 추가
  let dynamicPages: MetadataRoute.Sitemap = [];
  
  try {
    // 동적 import로 DB 연결 오류 격리
    const { getComposedProducts } = await import('@/lib/products');
    const { createSlug } = await import('@/lib/utils/slug');
    const { prisma } = await import('@gconnect/db');

    // 셀러 상품 조회
    try {
      const { combined } = await getComposedProducts({ 
        pageSize: 5000,
        sortBy: 'latest'
      });
      
      const productPages = combined
        .filter(product => product.id.startsWith('SELLER_'))
        .map((product) => {
          const numericId = product.id.replace(/^SELLER_/, '');
          const slug = createSlug(product.productName);
          
          return {
            url: `${baseUrl}/products/SELLER/${numericId}/${encodeURIComponent(slug)}`,
            lastModified: product.updatedAt || product.createdAt || new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
          };
        });
      
      dynamicPages.push(...productPages);
      console.log(`[Sitemap] ✅ ${productPages.length}개 상품 페이지 생성`);
    } catch (productError) {
      console.error('[Sitemap] ⚠️ 상품 페이지 생성 실패:', productError);
    }

    // 카테고리 조회
    try {
      const categories = await prisma.product.findMany({
        where: {
          enabled: true,
          source_cid: { not: null }
        },
        select: {
          source_cid: true,
          updated_at: true
        },
        distinct: ['source_cid']
      });

      const categoryPages = categories
        .filter(cat => cat.source_cid)
        .map((category) => ({
          url: `${baseUrl}/products?category=${category.source_cid}`,
          lastModified: category.updated_at || new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        }));

      dynamicPages.push(...categoryPages);
      console.log(`[Sitemap] ✅ ${categoryPages.length}개 카테고리 페이지 생성`);
    } catch (categoryError) {
      console.error('[Sitemap] ⚠️ 카테고리 페이지 생성 실패:', categoryError);
    }

  } catch (importError) {
    console.error('[Sitemap] ⚠️ 모듈 import 실패 (정적 페이지만 제공):', importError);
  }

  console.log(`[Sitemap] 총 ${staticPages.length + dynamicPages.length}개 URL 생성`);
  return [...staticPages, ...dynamicPages];
}
