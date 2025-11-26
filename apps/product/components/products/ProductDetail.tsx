'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShoppingBagIcon, ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import ImageGalleryModal from './ImageGalleryModal';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

interface ProductDetailProps {
  product: any;
  relatedProducts?: any[];
}

export default function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const discountRate = product.salePrice && product.price
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const finalPrice = product.salePrice || product.price;

  // 네이버 상품 URL 생성
  const naverProductUrl = product.productUrl || product.user?.naverShopUrl || '#';

  // 이미지 배열 (imageUrl + thumbnailUrl 사용, 실제로는 추가 이미지 배열이 있을 수 있음)
  const images: string[] = [];
  if (product.imageUrl) images.push(product.imageUrl);
  if (product.thumbnailUrl && product.thumbnailUrl !== product.imageUrl) {
    images.push(product.thumbnailUrl);
  }
  
  // 설명 길이 체크 (200자 이상이면 접기 기능 표시)
  const shouldShowReadMore = product.description && product.description.length > 200;
  const displayDescription = shouldShowReadMore && !isDescriptionExpanded
    ? product.description.substring(0, 200) + '...'
    : product.description;

  return (
    <>
      <div className="container-custom">
        {/* 브레드크럼 네비게이션 */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-white/60">
            <li>
              <a href="/" className="hover:text-white transition-colors">홈</a>
            </li>
            <li>›</li>
            <li>
              <a href="/products" className="hover:text-white transition-colors">상품</a>
            </li>
            {product.category1 && (
              <>
                <li>›</li>
                <li className="text-white/80">{product.category1}</li>
              </>
            )}
            {product.category2 && (
              <>
                <li>›</li>
                <li className="text-brand-neon">{product.category2}</li>
              </>
            )}
          </ol>
        </nav>

        {/* 메인 컨텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* 왼쪽: 이미지 영역 (2/3) */}
          <div className="lg:col-span-2">
            {/* 메인 이미지 */}
            <div 
              className="glass-card overflow-hidden mb-3 cursor-pointer group relative"
              onClick={() => images.length > 0 && setIsGalleryOpen(true)}
            >
              <div className="relative aspect-square bg-white/5">
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                    {/* 확대 아이콘 힌트 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="px-4 py-2 rounded-full bg-white/90 text-gray-900 text-sm font-semibold">
                        🔍 클릭하여 크게 보기
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/20 text-9xl">📦</span>
                  </div>
                )}

                {/* 할인 배지 */}
                {discountRate > 0 && (
                  <div className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white text-lg font-bold rounded-full shadow-lg z-10">
                    {discountRate}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* 썸네일 (여러 이미지가 있을 경우) */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`glass-card overflow-hidden w-20 h-20 flex-shrink-0 transition-all ${
                      selectedImage === index ? 'ring-2 ring-brand-neon' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={img}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 상품 정보 사이드바 (1/3) */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-6">
              {/* 상점명 */}
              {product.user?.shopName && (
                <div className="mb-3">
                  <a
                    href={product.user.naverShopUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-brand-neon transition-colors text-sm"
                  >
                    {product.user.shopName}
                  </a>
                </div>
              )}

              {/* 상품명 */}
              <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
                {product.name}
              </h1>

              {/* 카테고리 */}
              {product.category1 && (
                <div className="mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span>{product.category1}</span>
                    {product.category2 && (
                      <>
                        <span>›</span>
                        <span>{product.category2}</span>
                      </>
                    )}
                    {product.category3 && (
                      <>
                        <span>›</span>
                        <span>{product.category3}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 가격 */}
              <div className="mb-6">
                {product.salePrice ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-lg text-white/40 line-through">
                        {formatPrice(product.price)}원
                      </span>
                      <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                        {discountRate}%
                      </span>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                      {formatPrice(product.salePrice)}원
                    </div>
                  </>
                ) : (
                  <div className="text-3xl font-black text-white">
                    {formatPrice(product.price)}원
                  </div>
                )}
              </div>

              {/* 배송 정보 */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">배송</span>
                    <span className="text-white">무료배송</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">도착</span>
                    <span className="text-brand-neon font-semibold">오늘 출발 (23시 이전 주문)</span>
                  </div>
                </div>
              </div>

              {/* 구매 버튼 */}
              <div className="space-y-3 mb-6">
                <a
                  href={naverProductUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  네이버 스마트스토어에서 구매
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
                
                <div className="text-center">
                  <p className="text-xs text-white/50">
                    💡 안전한 결제를 위해 스마트스토어로 이동합니다
                  </p>
                </div>
              </div>

              {/* 판매자 정보 */}
              <div className="pt-6 border-t border-white/10">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">판매자</span>
                    <span className="text-white">{product.user?.shopName || '알 수 없음'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">등록일</span>
                    <span className="text-white">
                      {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 상세 설명 - 전체 너비 */}
        {product.description && (
          <div className="mb-12">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-white/10">
                상품 상세 설명
              </h2>
              <motion.div
                initial={false}
                animate={{ height: isDescriptionExpanded ? 'auto' : 'auto' }}
              >
                <div className="text-white/70 leading-relaxed whitespace-pre-wrap text-base">
                  {displayDescription}
                </div>
                
                {/* 더보기/접기 버튼 */}
                {shouldShowReadMore && (
                  <div className="text-center mt-6 pt-6 border-t border-white/10">
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-brand-neon transition-all font-semibold"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          <span>접기</span>
                          <ChevronUpIcon className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          <span>전체 설명 보기</span>
                          <ChevronDownIcon className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* 관련 상품 섹션 */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">관련 상품</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 이미지 갤러리 모달 */}
      {images.length > 0 && (
        <ImageGalleryModal
          images={images}
          initialIndex={selectedImage}
          productName={product.name}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      {/* 구조화된 데이터 (SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description || product.name,
            image: product.imageUrl || '',
            offers: {
              '@type': 'Offer',
              price: finalPrice,
              priceCurrency: 'KRW',
              availability: 'https://schema.org/InStock',
              url: naverProductUrl,
              seller: {
                '@type': 'Organization',
                name: product.user?.shopName || 'GConnect',
              },
            },
            brand: {
              '@type': 'Brand',
              name: product.user?.shopName || 'GConnect',
            },
          }),
        }}
      />
    </div>
  );
}

