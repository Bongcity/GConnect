import { NextResponse } from 'next/server';

// 이미지 사이트맵을 포함한 XML 생성
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_PRODUCT_URL || 'https://www.gconnect.kr';

  // SystemSettings 확인 - DDRo 상품 표시 여부
  let showDdroProducts = true;
  try {
    const { prisma: gconnectPrisma } = await import('@gconnect/db');
    const settings = await gconnectPrisma.systemSettings.findFirst();
    showDdroProducts = settings?.showDdroProducts ?? true;
    console.log(`[Sitemap] DDRo 상품 표시 설정: ${showDdroProducts ? 'ON' : 'OFF'}`);
  } catch (error) {
    console.warn('[Sitemap] ⚠️ SystemSettings 조회 실패, 기본값(true) 사용:', error);
  }

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // 정적 페이지
  const staticPages = [
    { url: baseUrl, changefreq: 'daily', priority: '1' },
    { url: `${baseUrl}/products`, changefreq: 'hourly', priority: '0.9' },
    { url: `${baseUrl}/search`, changefreq: 'weekly', priority: '0.7' },
  ];

  staticPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // 상품 및 카테고리 페이지 동적 추가
  try {
    const { prisma } = await import('@gconnect/db');
    const { createSlug } = await import('@/lib/utils/slug');

    // 셀러 상품 조회 (이미지 포함)
    try {
      const products = await prisma.product.findMany({
        where: {
          enabled: true,
        },
        select: {
          id: true,
          product_name: true,
          representative_product_image_url: true,
          updated_at: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5000,
      });

      products.forEach(product => {
        const numericId = product.id.toString();
        const slug = createSlug(product.product_name || '');
        const productUrl = `${baseUrl}/products/SELLER/${numericId}/${encodeURIComponent(slug)}`;
        const lastmod = (product.updated_at || product.created_at || new Date()).toISOString();

        sitemap += `
  <url>
    <loc>${productUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>`;

        // 대표 이미지가 있으면 추가
        if (product.representative_product_image_url) {
          const imageUrl = product.representative_product_image_url
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

          sitemap += `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
    </image:image>`;
        }

        sitemap += `
  </url>`;
      });

      console.log(`[Sitemap] ✅ ${products.length}개 상품 페이지 생성 (이미지 포함)`);
    } catch (productError) {
      console.error('[Sitemap] ⚠️ 상품 페이지 생성 실패:', productError);
    }

    // 카테고리 조회 (SELLER 상품의 카테고리만 조회됨)
    // Note: DDRo 카테고리는 별도 조회하지 않으므로 showDdroProducts 설정과 무관
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

      categories.forEach(category => {
        if (category.source_cid) {
          const categoryUrl = `${baseUrl}/products?category=${category.source_cid}`;
          const lastmod = (category.updated_at || new Date()).toISOString();

          sitemap += `
  <url>
    <loc>${categoryUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
        }
      });

      console.log(`[Sitemap] ✅ ${categories.length}개 카테고리 페이지 생성`);
    } catch (categoryError) {
      console.error('[Sitemap] ⚠️ 카테고리 페이지 생성 실패:', categoryError);
    }

  } catch (importError) {
    console.error('[Sitemap] ⚠️ 모듈 import 실패 (정적 페이지만 제공):', importError);
  }

  sitemap += `
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

