import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { prisma } from '@gconnect/db';

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isGoogleExposed: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
      include: {
        user: {
          select: {
            shopName: true,
          },
        },
      },
    });

    return products;
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return (
      <section className="section-padding bg-white/[0.02]">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">최신 상품</h2>
            <p className="text-white/60">새로 등록된 상품들을 확인해보세요</p>
          </div>
          <div className="glass-card p-12 text-center">
            <p className="text-white/60 text-lg">
              아직 등록된 상품이 없습니다.
            </p>
            <p className="text-white/40 text-sm mt-2">
              판매자 분들의 상품 등록을 기다리고 있습니다!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-white/[0.02]">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-2">최신 상품</h2>
            <p className="text-white/60">새로 등록된 상품들을 확인해보세요</p>
          </div>
          <Link
            href="/products"
            className="btn-secondary"
          >
            전체 보기 →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

