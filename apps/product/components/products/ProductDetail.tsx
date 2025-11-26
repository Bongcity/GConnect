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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 왼쪽: 이미지 */}
          <div>
            {/* 메인 이미지 */}
            <div 
              className="glass-card overflow-hidden mb-4 cursor-pointer group"
              onClick={() => images.length > 0 && setIsGalleryOpen(true)}
            >
              <div className="relative aspect-square bg-white/5">
                {/* 카테고리 배지 (이미지 위) */}
                {product.category1 && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="text-white text-sm font-semibold">
                        {product.category1}
                      </span>
                      {product.category2 && (
                        <>
                          <span className="text-white/40">›</span>
                          <span className="text-white/80 text-sm">{product.category2}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
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
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`glass-card overflow-hidden aspect-square ${
                    selectedImage === index ? 'ring-2 ring-brand-neon' : ''
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={img}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: 상품 정보 */}
        <div>
          {/* 상점명 */}
          {product.user?.shopName && (
            <div className="mb-4">
              <a
                href={product.user.naverShopUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/70 hover:bg-white/10 transition-colors text-sm"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                {product.user.shopName}
              </a>
            </div>
          )}

          {/* 상품명 */}
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            {product.name}
          </h1>

          {/* 가격 */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-brand-neon/10 to-brand-cyan/10 border border-brand-neon/20">
            {product.salePrice ? (
              <>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-black text-brand-neon">
                    {formatPrice(product.salePrice)}원
                  </span>
                  <span className="text-2xl text-white/40 line-through">
                    {formatPrice(product.price)}원
                  </span>
                </div>
                <p className="text-red-400 font-semibold">
                  {discountRate}% 할인 적용가
                </p>
              </>
            ) : (
              <div className="text-4xl font-black text-white">
                {formatPrice(product.price)}원
              </div>
            )}
          </div>

          {/* 설명 */}
          {product.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">상품 설명</h3>
              <motion.div 
                className="glass-card p-6"
                initial={false}
                animate={{ height: isDescriptionExpanded ? 'auto' : 'auto' }}
              >
                <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                  {displayDescription}
                </p>
                
                {/* 더보기/접기 버튼 */}
                {shouldShowReadMore && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-4 flex items-center gap-2 text-brand-neon hover:text-brand-cyan transition-colors font-semibold"
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
                )}
              </motion.div>
            </div>
          )}

          {/* 구매 버튼 */}
          <div className="space-y-4">
            <a
              href={naverProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-4"
            >
              <ShoppingBagIcon className="w-6 h-6" />
              네이버 스마트스토어에서 구매하기
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </a>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300 text-center">
                💡 네이버 스마트스토어로 이동하여 안전하게 구매하세요
              </p>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/40 mb-1">판매자</p>
                <p className="text-white">{product.user?.shopName || '알 수 없음'}</p>
              </div>
              <div>
                <p className="text-white/40 mb-1">등록일</p>
                <p className="text-white">
                  {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              {product.category1 && (
                <div>
                  <p className="text-white/40 mb-1">카테고리</p>
                  <p className="text-white">{product.category1}</p>
                </div>
              )}
              <div>
                <p className="text-white/40 mb-1">상품 ID</p>
                <p className="text-white/60 text-xs font-mono">{product.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 관련 상품 섹션 */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-white/10">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-white mb-8">관련 상품</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </div>
      )}

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

