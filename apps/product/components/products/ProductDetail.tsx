'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBagIcon, HeartIcon, ShareIcon, ChevronLeftIcon, ChevronRightIcon, ChevronRightIcon as ChevronRightSmall } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ProductCard from './ProductCard';
import type { UnifiedProduct } from '@/types/product';
import { favoriteStorage, recentStorage } from '@/lib/utils/localStorage';

interface ProductDetailProps {
  product: UnifiedProduct;
  relatedProducts?: UnifiedProduct[];
}

export default function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionLoaded, setIsDescriptionLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeDeliveryTab, setActiveDeliveryTab] = useState('delivery'); // delivery, exchange, return, refund
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [shareToastMessage, setShareToastMessage] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 상품 타입 구분: SELLER (네이버 API 연동) vs GLOBAL (DDRo)
  const detail = product.detail;

  // 클라이언트 마운트 확인 및 로컬스토리지 연동
  useEffect(() => {
    setMounted(true);
    
    // 좋아요 상태 로드
    if (typeof window !== 'undefined') {
      setIsLiked(favoriteStorage.has(product.id));
      
      // 최근 본 상품에 자동 추가
      recentStorage.add(product);
    }
  }, [product.id]);

  // iframe 로드 완료 시
  const handleIframeLoad = useCallback(() => {
    setIsDescriptionLoaded(true);
    
    // iframe 내부의 불필요한 여백 제거
    try {
      if (iframeRef.current?.contentWindow?.document) {
        const iframeDoc = iframeRef.current.contentWindow.document;
        
        // CSS 주입하여 body의 마진/패딩 제거
        const style = iframeDoc.createElement('style');
        style.textContent = `
          body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          html {
            margin: 0 !important;
            padding: 0 !important;
          }
        `;
        iframeDoc.head?.appendChild(style);
      }
    } catch (error) {
      // CORS 에러 시 무시 (외부 도메인이면 접근 불가)
      console.log('[ProductDetail] iframe CSS 주입 실패 (CORS)');
    }
  }, []);
  
  const formatPrice = (price: number | null) => {
    if (!price) return '가격 문의';
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 공유 모달 열기
  const handleShare = () => {
    setShowShareModal(true);
  };

  // 링크 복사
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('링크가 복사되었습니다! 📋');
      setShowShareModal(false);
    } catch (error) {
      showToast('링크 복사에 실패했습니다.');
      console.error('[ProductDetail] 링크 복사 오류:', error);
    }
  };

  // 네이티브 공유
  const handleNativeShare = async () => {
    const shareData = {
      title: product.productName,
      text: `${product.productName} - GConnect에서 확인하세요`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast('공유되었습니다! 🎉');
        setShowShareModal(false);
      } else {
        // Web Share API 미지원 시 링크 복사
        await handleCopyLink();
      }
    } catch (error: any) {
      // 사용자가 공유를 취소한 경우 (AbortError)
      if (error.name === 'AbortError') {
        setShowShareModal(false);
        return;
      }
      
      showToast('공유에 실패했습니다.');
      console.error('[ProductDetail] 공유 오류:', error);
    }
  };

  // 토스트 메시지 표시
  const showToast = (message: string) => {
    setShareToastMessage(message);
    setShowShareToast(true);
    
    setTimeout(() => {
      setShowShareToast(false);
    }, 3000);
  };

  // 할인율 계산
  const discountRate = product.discountedSalePrice && product.salePrice && product.salePrice > 0
    ? Math.round(((product.salePrice - product.discountedSalePrice) / product.salePrice) * 100)
    : 0;

  const finalPrice = product.discountedSalePrice || product.salePrice;

  // 이미지 배열 구성
  const images: string[] = [];
  if (product.representativeProductImageUrl) {
    images.push(product.representativeProductImageUrl);
  }
  // 추가 이미지가 있으면 파싱
  if (product.otherProductImageUrls) {
    try {
      const otherImages = JSON.parse(product.otherProductImageUrls);
      if (Array.isArray(otherImages)) {
        images.push(...otherImages);
      }
    } catch {
      // JSON 파싱 실패 시 무시
    }
  }
  
  // 기본 이미지가 없으면 placeholder
  if (images.length === 0) {
    images.push('https://via.placeholder.com/800x800/1a1a2e/39ff14?text=No+Image');
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 카테고리 계층 구조 파싱
  const parseCategoryHierarchy = () => {
    if (!product.sourceCategoryName) return [];
    
    // "가구/인테리어 > DIY자재/용품 > 리모델링" 형식을 파싱
    const categories = product.sourceCategoryName.split('>').map(cat => cat.trim());
    return categories;
  };

  // 카테고리 링크 생성
  const getCategoryLink = () => {
    if (product.sourceCid) {
      return `/products?category=${product.sourceCid}`;
    }
    return '/products';
  };

  // JSON-LD 구조화된 데이터 (Schema.org Product)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.productName,
    "image": images,
    "description": product.productName,
    "sku": product.id,
    "brand": product.storeName ? {
      "@type": "Brand",
      "name": product.storeName
    } : undefined,
    "category": product.sourceCategoryName || undefined,
    "offers": {
      "@type": "Offer",
      "url": product.productUrl || `https://www.gconnect.kr/products/${product.id.startsWith('GLOBAL_') ? 'GLOBAL' : 'SELLER'}/${product.id.replace(/^(GLOBAL_|SELLER_)/, '')}`,
      "priceCurrency": "KRW",
      "price": finalPrice || 0,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 후
      "availability": detail?.statusType === 'OUTOFSTOCK' 
        ? "https://schema.org/OutOfStock" 
        : "https://schema.org/InStock",
      "seller": product.storeName ? {
        "@type": "Organization",
        "name": product.storeName
      } : undefined
    }
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": "https://www.gconnect.kr"
      },
      ...parseCategoryHierarchy().map((category, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": category,
        "item": index === parseCategoryHierarchy().length - 1 
          ? undefined 
          : `https://www.gconnect.kr/products?category=${product.sourceCid}`
      }))
    ]
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* JSON-LD 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      <div className="container-custom pt-4 pb-8">
        {/* 브레드크럼 */}
        <nav className="mb-6">
          <ol className="flex items-center flex-wrap gap-2 text-sm text-white/60">
            <li><Link href="/" className="hover:text-brand-neon transition-colors">홈</Link></li>
            {parseCategoryHierarchy().length > 0 ? (
              <>
                {parseCategoryHierarchy().map((category, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-white/40">&gt;</span>
                    {index === parseCategoryHierarchy().length - 1 ? (
                      // 마지막 카테고리는 현재 페이지이므로 링크 없음
                      <span className="text-white/80">{category}</span>
                    ) : (
                      // 이전 카테고리들은 클릭 가능
                      <Link 
                        href={getCategoryLink()} 
                        className="hover:text-brand-neon transition-colors"
                      >
                        {category}
                      </Link>
                    )}
                  </li>
                ))}
              </>
            ) : (
              <>
                <span className="text-white/40">&gt;</span>
                <li><Link href="/products" className="hover:text-brand-neon transition-colors">전체 상품</Link></li>
              </>
            )}
          </ol>
        </nav>

        {/* 메인 상품 정보 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* 왼쪽: 이미지 갤러리 */}
          <div className="space-y-4">

            {/* 메인 이미지 */}
            <div className="relative aspect-square bg-dark-card rounded-2xl overflow-hidden group">
              <img
                src={images[selectedImageIndex]}
                alt={product.productName}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* 이미지 네비게이션 버튼 */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="이전 이미지"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="다음 이미지"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* 할인 배지 */}
              {discountRate > 0 && (
                <div className="absolute top-4 left-4 bg-brand-neon text-dark-bg px-3 py-1.5 rounded-full font-bold text-sm">
                  {discountRate}% OFF
                </div>
              )}
            </div>

            {/* 썸네일 이미지 갤러리 */}
            {images.length > 1 && (
              <div className="relative">
                {/* 스크롤 가능한 썸네일 컨테이너 */}
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 pb-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                          index === selectedImageIndex
                            ? 'ring-2 ring-brand-neon scale-105'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.productName} ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* 이미지 순서 표시 */}
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}/{images.length}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 이미지 개수 표시 */}
                {images.length > 4 && (
                  <div className="mt-2 text-center text-sm text-white/60">
                    전체 {images.length}개 이미지 · 좌우로 스크롤하세요
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 오른쪽: 상품 정보 */}
          <div className="space-y-6">
            {/* 상품명 */}
            <div>
              <h1 className="text-3xl font-bold">{product.productName}</h1>
            </div>

            {/* 가격 정보 */}
            <div className="py-6">
              {product.discountedSalePrice && product.salePrice && (
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-brand-neon">{discountRate}%</span>
                  <span className="text-lg text-white/40 line-through">
                    {formatPrice(product.salePrice)}원
                  </span>
                </div>
              )}
              <div className="text-4xl font-bold">
                {formatPrice(finalPrice)}
                <span className="text-2xl ml-1">원</span>
              </div>
            </div>

            {/* 최대 적립 포인트 */}
            {finalPrice && (
              <div className="border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg">최대 적립 포인트</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-neon">
                      {(() => {
                        const basePoint = detail?.sellerPurchasePoint || Math.floor(finalPrice * 0.001);
                        const nMembershipPoint = Math.floor(finalPrice * 0.005);
                        const nPayPoint = Math.floor(finalPrice * 0.004);
                        return (basePoint + nMembershipPoint + nPayPoint).toLocaleString();
                      })()}원
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-white/60">기본적립</span>
                    <span className="text-white/90">
                      {(() => {
                        const basePoint = detail?.sellerPurchasePoint || Math.floor(finalPrice * 0.001);
                        return basePoint.toLocaleString();
                      })()}원
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="bg-brand-neon text-dark-bg text-xs px-2 py-0.5 rounded font-bold">N</span>
                      <span className="text-white/60">멤버십 추가 적립</span>
                    </div>
                    <span className="text-brand-neon font-medium">{Math.floor(finalPrice * 0.005).toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-brand-neon text-dark-bg text-xs px-2 py-0.5 rounded font-bold">N</span>
                      <span className="text-white/60">네이버페이 머니 결제 시 추가 적립</span>
                    </div>
                    <span className="text-brand-neon font-medium">{Math.floor(finalPrice * 0.004).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            )}

            {/* 상품 정보 */}
            <div className="border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">상품 정보</h3>
              
              <div className="space-y-3 text-sm">
                {/* 판매자 */}
                {product.storeName && (
                  <div className="flex items-start gap-4">
                    <span className="text-white/60 min-w-[80px]">판매자</span>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-white/90">{product.storeName}</p>
                        {product.brandStore && (
                          <span className="text-xs text-brand-neon">브랜드 스토어</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 브랜드 (SELLER 전용) */}
                {detail?.brandName && (
                  <div className="flex items-start gap-4">
                    <span className="text-white/60 min-w-[80px]">브랜드</span>
                    <span className="text-white/90">{detail.brandName}</span>
                  </div>
                )}
                
                {/* 제조사 (SELLER 전용) */}
                {detail?.manufacturerName && (
                  <div className="flex items-start gap-4">
                    <span className="text-white/60 min-w-[80px]">제조사</span>
                    <span className="text-white/90">{detail.manufacturerName}</span>
                  </div>
                )}
                
                {/* 배송비 (SELLER 전용) */}
                {detail?.deliveryFee !== undefined && detail?.deliveryFee !== null && (
                  <div className="flex items-start gap-4">
                    <span className="text-white/60 min-w-[80px]">배송비</span>
                    <span className="text-white/90">
                      {detail.deliveryFee === 0 ? '무료배송' : `${detail.deliveryFee.toLocaleString()}원`}
                    </span>
                  </div>
                )}
                
                {/* 판매상태 (SELLER 전용) */}
                {detail?.statusType && (
                  <div className="flex items-start gap-4">
                    <span className="text-white/60 min-w-[80px]">판매상태</span>
                    <span className={`font-medium ${
                      detail.statusType === 'SALE' ? 'text-brand-neon' : 'text-white/60'
                    }`}>
                      {detail.statusType === 'SALE' ? '판매중' : 
                       detail.statusType === 'SUSPENSION' ? '판매중지' : 
                       detail.statusType === 'OUTOFSTOCK' ? '품절' : detail.statusType}
                    </span>
                  </div>
                )}

                {/* 무이자할부 혜택 */}
                {detail?.freeInterest && detail.freeInterest > 0 && (
                  <div className="flex items-start gap-4 pt-2 border-t border-white/10">
                    <span className="font-medium text-brand-neon min-w-[80px]">혜택</span>
                    <span className="text-brand-neon">{detail.freeInterest}개월 무이자할부</span>
                  </div>
                )}
                
                {/* 사은품 */}
                {detail?.gift && (
                  <div className="flex items-start gap-4">
                    <span className="font-medium text-white/90 min-w-[80px]">사은품</span>
                    <span className="text-white/90">{detail.gift}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const newLiked = favoriteStorage.toggle(product);
                    setIsLiked(newLiked);
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  {isLiked ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  좋아요
                </button>
                <button
                  onClick={handleShare}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <ShareIcon className="w-5 h-5" />
                  공유하기
                </button>
              </div>
              <a
                href={product.productUrl || product.affiliateUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-4"
              >
                <ShoppingBagIcon className="w-6 h-6" />
                네이버 스토어에서 구매하기
              </a>
            </div>
          </div>
        </div>

        {/* 배송/교환/반품 안내 (탭 형식) */}
        <div className="glass-card p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">배송/교환/반품 안내</h2>
          
          {/* 탭 메뉴 */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveDeliveryTab('delivery')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeDeliveryTab === 'delivery'
                  ? 'border-brand-neon text-brand-neon'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              배송
            </button>
            <button
              onClick={() => setActiveDeliveryTab('exchange')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeDeliveryTab === 'exchange'
                  ? 'border-brand-neon text-brand-neon'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              교환
            </button>
            <button
              onClick={() => setActiveDeliveryTab('return')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeDeliveryTab === 'return'
                  ? 'border-brand-neon text-brand-neon'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              반품
            </button>
            <button
              onClick={() => setActiveDeliveryTab('refund')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeDeliveryTab === 'refund'
                  ? 'border-brand-neon text-brand-neon'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              환불
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="text-white/70 text-sm space-y-3">
            {activeDeliveryTab === 'delivery' && (
              <div className="space-y-3">
                {detail ? (
                  <>
                    {detail.deliveryAttributeType === 'TODAY' && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block bg-brand-neon text-dark-bg text-xs px-3 py-1 rounded font-bold">
                          오늘출발
                        </span>
                      </div>
                    )}
                    <p>
                      <strong className="text-white/90">배송비:</strong>{' '}
                      {detail.deliveryFee !== undefined && detail.deliveryFee !== null ? (
                        detail.deliveryFee === 0 ? (
                          <span className="text-brand-neon font-medium">무료배송</span>
                        ) : (
                          <span>{detail.deliveryFee.toLocaleString()}원</span>
                        )
                      ) : (
                        <span>판매자 정책에 따릅니다</span>
                      )}
                    </p>
                    <p>
                      <strong className="text-white/90">배송기간:</strong> 주문 후 2-3일 이내 발송 (영업일 기준)
                    </p>
                    <p className="text-white/50 text-xs mt-3">
                      * 도서산간 지역은 추가 배송비가 발생할 수 있습니다.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong className="text-white/90">배송:</strong> 네이버 스마트스토어 정책에 따릅니다.
                    </p>
                    <p>일반적으로 주문 후 2-3일 이내 발송됩니다 (영업일 기준).</p>
                  </>
                )}
              </div>
            )}

            {activeDeliveryTab === 'exchange' && (
              <div className="space-y-3">
                <p>
                  <strong className="text-white/90">교환 가능 기간:</strong> 상품 수령 후 7일 이내
                </p>
                {detail?.exchangeFee !== undefined && detail?.exchangeFee !== null && detail.exchangeFee > 0 && (
                  <p>
                    <strong className="text-white/90">교환비용:</strong> {detail.exchangeFee.toLocaleString()}원
                  </p>
                )}
                <p>단순 변심으로 인한 교환 시 왕복 배송비가 발생합니다.</p>
                <p className="text-white/50 text-xs mt-3">
                  * 상품 하자 또는 오배송의 경우 무료로 교환해드립니다.
                </p>
              </div>
            )}

            {activeDeliveryTab === 'return' && (
              <div className="space-y-3">
                <p>
                  <strong className="text-white/90">반품 가능 기간:</strong> 상품 수령 후 7일 이내
                </p>
                {detail?.returnFee !== undefined && detail?.returnFee !== null && detail.returnFee > 0 && (
                  <p>
                    <strong className="text-white/90">반품비용:</strong> {detail.returnFee.toLocaleString()}원
                  </p>
                )}
                <p>단순 변심으로 인한 반품 시 왕복 배송비가 발생합니다.</p>
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-white/90 font-medium mb-2">반품 불가 사항:</p>
                  <ul className="list-disc list-inside space-y-1 text-white/60 text-xs">
                    <li>포장을 개봉하여 사용감이 있는 경우</li>
                    <li>상품 가치가 훼손된 경우</li>
                    <li>시간이 지나 재판매가 곤란한 경우</li>
                  </ul>
                </div>
              </div>
            )}

            {activeDeliveryTab === 'refund' && (
              <div className="space-y-3">
                <p>
                  <strong className="text-white/90">환불 처리 기간:</strong> 상품 회수 확인 후 영업일 기준 3일 이내
                </p>
                <p>
                  <strong className="text-white/90">환불 방법:</strong> 결제하신 수단으로 자동 환불됩니다.
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-white/60">• 신용카드: 카드사 승인 취소 (영업일 3-5일 소요)</p>
                  <p className="text-white/60">• 계좌이체: 환불 계좌로 입금 (영업일 2-3일 소요)</p>
                  <p className="text-white/60">• 네이버페이: 네이버페이 포인트 또는 결제수단으로 환불</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 상세 설명 섹션 */}
        {mounted && product.productDescriptionUrl && (
          <div className="mb-16 -mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">상세 설명</h2>
              <a
                href={product.productDescriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-brand-neon hover:text-brand-neon/80 transition-colors"
              >
                원본보기
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            
            <div className="glass-card overflow-hidden">
              {/* 로딩 상태 */}
              {!isDescriptionLoaded && (
                <div className="flex items-center justify-center bg-dark-card py-20">
                  <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-brand-neon border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white/60">상세 설명 불러오는 중...</p>
                  </div>
                </div>
              )}
              
              {/* iframe 컨테이너 */}
              <div 
                className={`relative transition-all duration-500 ease-in-out ${
                  showFullDescription ? 'max-h-[2500px] overflow-y-auto' : 'max-h-[500px] overflow-hidden'
                }`}
                style={{ 
                  display: isDescriptionLoaded ? 'block' : 'none'
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={product.productDescriptionUrl}
                  className="w-full border-0"
                  style={{ 
                    height: '2500px',
                    minHeight: '500px'
                  }}
                  onLoad={handleIframeLoad}
                  title="상품 상세 설명"
                  sandbox="allow-scripts allow-same-origin"
                />
                
                {/* 하단 그라데이션 */}
                {!showFullDescription && (
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-transparent pointer-events-none" />
                )}
              </div>
              
              {/* 더보기 버튼 */}
              {!showFullDescription && isDescriptionLoaded && (
                <div className="p-6 bg-dark-card/20 backdrop-blur-sm rounded-b-xl">
                  <button
                    onClick={() => setShowFullDescription(true)}
                    className="mx-auto max-w-md py-3 px-6 bg-brand-neon/80 backdrop-blur-lg border border-brand-neon/50 hover:bg-brand-neon/90 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 group shadow-lg hover:shadow-brand-neon/30"
                  >
                    <span>상세내용 더보기</span>
                    <svg 
                      className="w-5 h-5 transition-transform group-hover:translate-y-0.5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 관련 상품 섹션 */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">관련 상품</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}

        {/* 공유 모달 */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 배경 오버레이 */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowShareModal(false)}
            />
            
            {/* 모달 컨텐츠 */}
            <div className="relative glass-card p-6 w-full max-w-sm animate-bounce-in">
              <h3 className="text-xl font-bold text-white mb-6 text-center">
                공유하기
              </h3>
              
              <div className="space-y-3">
                {/* 링크 복사 */}
                <button
                  onClick={handleCopyLink}
                  className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-neon/20 to-brand-cyan/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-brand-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">링크 복사</p>
                    <p className="text-sm text-white/60">클립보드에 복사</p>
                  </div>
                </button>

                {/* 공유하기 */}
                <button
                  onClick={handleNativeShare}
                  className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-cyan/20 to-brand-neon/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShareIcon className="w-6 h-6 text-brand-cyan" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">공유하기</p>
                    <p className="text-sm text-white/60">카카오톡, SNS 등</p>
                  </div>
                </button>
              </div>

              {/* 닫기 버튼 */}
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 공유 토스트 메시지 */}
        {showShareToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
            <div className="glass-card px-6 py-4 shadow-2xl shadow-brand-neon/20">
              <p className="text-white font-medium text-center whitespace-nowrap">
                {shareToastMessage}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
