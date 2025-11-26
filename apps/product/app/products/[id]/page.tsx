import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductDetail from '@/components/products/ProductDetail';
import { prisma } from '@gconnect/db';

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            shopName: true,
            naverShopUrl: true,
          },
        },
      },
    });

    return product;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

async function getRelatedProducts(productId: string, category1?: string, category2?: string) {
  try {
    // 같은 카테고리의 다른 상품들 가져오기
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        OR: [
          { category1: category1 || '' },
          { category2: category2 || '' },
        ],
      },
      include: {
        user: {
          select: {
            shopName: true,
            naverShopUrl: true,
          },
        },
      },
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return relatedProducts;
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: '상품을 찾을 수 없습니다 - GConnect',
    };
  }

  const price = product.salePrice || product.price;

  return {
    title: `${product.name} - GConnect`,
    description: product.description?.substring(0, 155) || `${product.name}${price ? ` - ${price.toLocaleString()}원` : ''}`,
    openGraph: {
      title: product.name,
      description: product.description?.substring(0, 155) || product.name,
      images: product.imageUrl ? [product.imageUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.substring(0, 155) || product.name,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  // 관련 상품 가져오기
  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category1 || undefined,
    product.category2 || undefined
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

