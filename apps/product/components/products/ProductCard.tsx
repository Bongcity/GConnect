import Link from 'next/link';
import type { UnifiedProduct } from '@/types/product';
import { createProductUrl } from '@/lib/utils/slug';

interface ProductCardProps {
  product: UnifiedProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: bigint | null) => {
    if (!price) return '가격 문의';
    return new Intl.NumberFormat('ko-KR').format(Number(price));
  };

  // 할인율 계산
  const discountRate = product.discountedSalePrice && product.salePrice && product.salePrice > BigInt(0)
    ? Math.round((Number(product.salePrice) - Number(product.discountedSalePrice)) / Number(product.salePrice) * 100)
    : 0;

  // 최종 가격 (할인가가 있으면 할인가, 없으면 정가)
  const finalPrice = product.discountedSalePrice || product.salePrice;

  return (
    <Link
      href={createProductUrl(product)}
      className="glass-card overflow-hidden group hover:scale-105 transition-transform duration-300"
    >
      {/* 이미지 */}
      <div className="relative aspect-square bg-gradient-to-br from-white/10 to-white/5 overflow-hidden">
        {product.representativeProductImageUrl ? (
          <img
            src={product.representativeProductImageUrl}
            alt={product.productName}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className="text-8xl font-bold text-brand-neon/30 mb-2">
              {product.productName.charAt(0)}
            </div>
            <div className="text-sm text-white/30 text-center line-clamp-3">
              {product.productName}
            </div>
          </div>
        )}
        
        {/* 할인 배지 */}
        {discountRate > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
            {discountRate}% OFF
          </div>
        )}
        
        {/* SELLER/GLOBAL 배지 */}
        <div className="absolute top-3 right-3">
          {product.source === 'SELLER' ? (
            <span className="px-2 py-1 bg-brand-neon/90 text-dark-bg text-xs font-bold rounded">
              파트너
            </span>
          ) : (
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
              네이버
            </span>
          )}
        </div>
      </div>

      {/* 정보 */}
      <div className="p-4">
        {/* 상점명 */}
        {product.storeName && (
          <p className="text-xs text-white/40 mb-2">{product.storeName}</p>
        )}
        
        {/* 상품명 */}
        <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-brand-neon transition-colors">
          {product.productName}
        </h3>

        {/* 가격 */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.discountedSalePrice && product.salePrice ? (
            <>
              <span className="text-lg font-bold text-brand-neon">
                {formatPrice(product.discountedSalePrice)}원
              </span>
              <span className="text-sm text-white/40 line-through">
                {formatPrice(product.salePrice)}원
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-white">
              {formatPrice(finalPrice)}원
            </span>
          )}
        </div>

        {/* 메타 정보 */}
        {product.sourceKeyword && (
          <p className="text-xs text-white/30 mt-2">
            #{product.sourceKeyword}
          </p>
        )}
      </div>
    </Link>
  );
}
