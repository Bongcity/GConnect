import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductDetail from '@/components/products/ProductDetail';
import { getProductById, getComposedProducts } from '@/lib/products';
import { createSlug, reconstructProductId } from '@/lib/utils/slug';

async function getRelatedProducts(currentProductId: string, sourceCid?: string | null) {
  try {
    const result = await getComposedProducts({
      category: sourceCid || undefined,
      pageSize: 21, // 현재 상품 제외하고 20개를 보여주기 위해 21개 요청
    });

    // 현재 상품을 제외하고 20개만 반환
    return result.combined.filter(p => p.id !== currentProductId).slice(0, 20);
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { type: string; id: string; slug: string };
}): Promise<Metadata> {
  const fullId = reconstructProductId(params.type, params.id);
  const product = await getProductById(fullId);

  if (!product) {
    return {
      title: '상품을 찾을 수 없습니다 - GConnect',
    };
  }

  const price = product.discountedSalePrice || product.salePrice;
  const canonicalUrl = `/products/${params.type}/${params.id}/${createSlug(product.productName)}`;

  return {
    title: `${product.productName} - GConnect`,
    description: `${product.productName}${price ? ` - ${price.toLocaleString()}원` : ''}`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.productName,
      description: product.productName,
      images: product.representativeProductImageUrl ? [product.representativeProductImageUrl] : [],
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.productName,
      description: product.productName,
      images: product.representativeProductImageUrl ? [product.representativeProductImageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { type: string; id: string; slug: string };
}) {
  // 타입과 ID로 전체 상품 ID 재구성
  const fullId = reconstructProductId(params.type, params.id);
  const product = await getProductById(fullId);

  if (!product) {
    notFound();
  }

  // TODO: Slug 검증 (현재 비활성화 - React hooks 오류 해결 후 재활성화)
  // const correctSlug = createSlug(product.productName);
  // if (params.slug !== correctSlug) {
  //   redirect(`/products/${params.type}/${params.id}/${correctSlug}`, 'replace');
  // }

  // 관련 상품 가져오기
  const relatedProducts = await getRelatedProducts(
    product.id,
    product.sourceCid
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 section-padding">
        <ProductDetail product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </div>
  );
}

