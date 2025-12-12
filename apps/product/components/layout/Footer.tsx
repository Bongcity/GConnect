import Link from 'next/link';

const SELLER_URL = process.env.NEXT_PUBLIC_SELLER_URL || 'https://seller.gconnect.kr';
const IR_URL = process.env.NEXT_PUBLIC_IR_URL || 'https://gconnect.kr';

export default function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-auto">
      <div className="container-custom py-8">
        {/* 메인 푸터 라인 */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 pb-6 border-b border-white/10">
          {/* 로고 & 슬로건 */}
          <div className="flex flex-col items-center lg:items-start gap-2">
            <Link href="/" className="inline-block">
              <div className="relative w-32 h-8">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan"
                  style={{
                    WebkitMaskImage: 'url(/GConnect-logo.png)',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: 'url(/GConnect-logo.png)',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                  }}
                />
              </div>
            </Link>
            <p className="text-white/50 text-xs font-medium">
              스마트한 쇼핑의 시작
            </p>
          </div>

          {/* 쇼핑 링크 */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link href="/products" className="text-white/60 hover:text-white text-sm transition-colors">
              전체 상품
            </Link>
            <Link href="/products?sort=latest" className="text-white/60 hover:text-white text-sm transition-colors">
              신상품
            </Link>
            <Link href="/products?sort=popular" className="text-white/60 hover:text-white text-sm transition-colors">
              인기 상품
            </Link>
          </div>

          {/* 판매자 링크 */}
          <div className="flex items-center gap-4 lg:gap-6">
            <a
              href={`${SELLER_URL}/register`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              판매자 등록
            </a>
            <a
              href={`${IR_URL}/how-it-works`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              서비스 안내
            </a>
          </div>

          {/* 회사 정보 */}
          <div className="text-white/40 text-xs text-center lg:text-right">
            <p className="mb-1">인포24</p>
            <p className="text-white/30">514-24-41035</p>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="pt-4 text-white/30 text-xs text-center space-y-1.5">
          <p>
            통신판매업신고: 제 2022-대구수성구-0486 호 | 대표자명: 박건우
          </p>
          <p>
            주소: 대구광역시 수성구 국채보상로186길 51, 2층
          </p>
          <p className="pt-2 text-white/20 text-[11px]">
            Copyright by 인포24 . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

