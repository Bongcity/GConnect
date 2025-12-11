'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBagIcon, HeartIcon, ShareIcon, ChevronLeftIcon, ChevronRightIcon, ChevronRightIcon as ChevronRightSmall } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ProductCard from './ProductCard';
import type { UnifiedProduct } from '@/types/product';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 상품 타입 구분: SELLER (네이버 API 연동) vs GLOBAL (DDRo)
  const detail = product.detail;

  // 클라이언트 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // 카테고리 링크 생성
  const getCategoryLink = () => {
    if (product.sourceCid) {
      return `/category/${product.sourceCid}`;
    }
    return '/products';
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container-custom pt-4 pb-8">
        {/* 브레드크럼 */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-white/60">
            <li><Link href="/" className="hover:text-brand-neon transition-colors">홈</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-brand-neon transition-colors">전체 상품</Link></li>
            {product.sourceCategoryName && (
              <>
                <li>/</li>
                <li className="text-white/80">{product.sourceCategoryName}</li>
              </>
            )}
          </ol>
        </nav>

        {/* 메인 상품 정보 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* 왼쪽: 이미지 갤러리 */}
          <div className="space-y-4">
            {/* 카테고리 (이미지 위) */}
            {product.sourceCategoryName && (
              <div className="mb-4">
                <Link 
                  href={getCategoryLink()}
                  className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-brand-neon transition-colors group"
                >
                  <span>카테고리: {product.sourceCategoryName}</span>
                  <ChevronRightSmall className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}

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

            {/* 썸네일 이미지 */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
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
                  </button>
                ))}
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
                  onClick={() => setIsLiked(!isLiked)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  {isLiked ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  좋아요
                </button>
                <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
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
      </div>
    </div>
  );
}
