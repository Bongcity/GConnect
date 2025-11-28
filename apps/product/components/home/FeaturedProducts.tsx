import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { getComposedProducts } from '@/lib/products';

/**
 * 홈 페이지 Featured Products 섹션
 * 
 * SELLER 상품을 우선 노출하고, 부족분을 GLOBAL 상품으로 보완
 */
export default async function FeaturedProducts() {
  // SELLER 우선 + GLOBAL 보완 상품 조회
  const result = await getComposedProducts({
    sortBy: 'latest',
    pageSize: 8,
  });

  const { sellerProducts, globalProducts, combined } = result;
  const hasProducts = combined.length > 0;
  const hasSellerProducts = sellerProducts.length > 0;
  const hasGlobalProducts = globalProducts.length > 0;

  // 상품이 전혀 없는 경우
  if (!hasProducts) {
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
              곧 GCONNECT 파트너 스토어가 입점할 예정입니다!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-white/[0.02]">
      <div className="container-custom">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4">최신 상품</h2>
            <p className="text-white/60">
              새로 등록된 상품들을 확인해보세요
              {hasSellerProducts && (
                <span className="ml-2 text-brand-neon">
                  (파트너 {sellerProducts.length}개 · 네이버 {globalProducts.length}개)
                </span>
              )}
            </p>
          </div>
          <Link
            href="/products"
            className="text-brand-neon hover:text-brand-cyan transition-colors font-medium flex items-center gap-2"
          >
            전체 보기 →
          </Link>
        </div>

        {/* 통합 상품 그리드 (SELLER 우선, 그 다음 GLOBAL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {combined.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* SELLER 상품이 없는 경우 안내 */}
        {!hasSellerProducts && hasGlobalProducts && (
          <div className="glass-card p-6 text-center mt-8">
            <p className="text-white/60 text-sm">
              💡 곧 GCONNECT 파트너 스토어가 입점합니다!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
