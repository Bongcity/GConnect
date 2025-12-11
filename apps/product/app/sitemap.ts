import { MetadataRoute } from 'next';
import { getComposedProducts } from '@/lib/products';
import { createSlug } from '@/lib/utils/slug';
import { prisma } from '@gconnect/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_PRODUCT_URL || 'https://www.gconnect.kr';

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

  // 상품 페이지 동적 추가 (셀러 상품)
  let productPages: MetadataRoute.Sitemap = [];
  try {
    // 활성화된 셀러 상품 조회 (최대 5000개)
    const { combined } = await getComposedProducts({ 
      pageSize: 5000,
      sortBy: 'latest'
    });
    
    productPages = combined
      .filter(product => product.id.startsWith('SELLER_')) // 셀러 상품만
      .map((product) => {
        const type = 'SELLER';
        const numericId = product.id.replace(/^SELLER_/, '');
        const slug = createSlug(product.productName);
        
        return {
          url: `${baseUrl}/products/${type}/${numericId}/${slug}`,
          lastModified: product.updatedAt || product.createdAt || new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        };
      });
    
    console.log(`[Sitemap] ${productPages.length}개 상품 페이지 생성`);
  } catch (error) {
    console.error('[Sitemap] 상품 페이지 생성 실패:', error);
  }

  // 카테고리 페이지 동적 추가
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    // 사용 중인 카테고리 CID 조회
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

    categoryPages = categories
      .filter(cat => cat.source_cid)
      .map((category) => ({
        url: `${baseUrl}/products?category=${category.source_cid}`,
        lastModified: category.updated_at || new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));

    console.log(`[Sitemap] ${categoryPages.length}개 카테고리 페이지 생성`);
  } catch (error) {
    console.error('[Sitemap] 카테고리 페이지 생성 실패:', error);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
