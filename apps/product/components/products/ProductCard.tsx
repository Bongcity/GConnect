import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const discountRate = product.discountPrice && product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="glass-card overflow-hidden group hover:scale-105 transition-transform duration-300"
    >
      {/* 이미지 */}
      <div className="relative aspect-square bg-white/5 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-6xl">📦</span>
          </div>
        )}
        
        {/* 할인 배지 */}
        {discountRate > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
            {discountRate}% OFF
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4">
        {/* 상점명 */}
        {product.user?.shopName && (
          <p className="text-xs text-white/40 mb-2">{product.user.shopName}</p>
        )}
        
        {/* 상품명 */}
        <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-brand-neon transition-colors">
          {product.name}
        </h3>

        {/* 가격 */}
        <div className="flex items-center gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-lg font-bold text-brand-neon">
                {formatPrice(product.discountPrice)}원
              </span>
              <span className="text-sm text-white/40 line-through">
                {formatPrice(product.price)}원
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-white">
              {formatPrice(product.price)}원
            </span>
          )}
        </div>

        {/* 카테고리 */}
        {product.category1 && (
          <p className="text-xs text-white/30 mt-2">
            {product.category1}
            {product.category2 && ` > ${product.category2}`}
          </p>
        )}
      </div>
    </Link>
  );
}

