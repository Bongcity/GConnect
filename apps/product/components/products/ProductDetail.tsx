'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShoppingBagIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface ProductDetailProps {
  product: any;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const discountRate = product.discountPrice && product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const finalPrice = product.discountPrice || product.price;

  // 네이버 상품 URL 생성
  const naverProductUrl = product.productUrl || product.user?.naverShopUrl || '#';

  // 이미지 배열 (실제로는 여러 이미지가 있을 수 있음)
  const images = product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="container-custom">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 왼쪽: 이미지 */}
        <div>
          {/* 메인 이미지 */}
          <div className="glass-card overflow-hidden mb-4">
            <div className="relative aspect-square bg-white/5">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white/20 text-9xl">📦</span>
                </div>
              )}

              {/* 할인 배지 */}
              {discountRate > 0 && (
                <div className="absolute top-6 left-6 px-4 py-2 bg-red-500 text-white text-lg font-bold rounded-full shadow-lg">
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
            {product.discountPrice ? (
              <>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-black text-brand-neon">
                    {formatPrice(product.discountPrice)}원
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

          {/* 카테고리 */}
          {product.category1 && (
            <div className="mb-6">
              <h3 className="text-sm text-white/40 mb-2">카테고리</h3>
              <div className="flex items-center gap-2 text-white/70">
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

          {/* 설명 */}
          {product.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">상품 설명</h3>
              <div className="glass-card p-6">
                <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
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

