import Link from 'next/link';

const SELLER_URL = process.env.NEXT_PUBLIC_SELLER_URL || 'https://seller.gconnect.kr';
const IR_URL = process.env.NEXT_PUBLIC_IR_URL || 'https://gconnect.kr';

export default function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-auto">
      <div className="container-custom py-6">
        {/* 상단: 로고 + 링크 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
          {/* 로고 */}
          <Link href="/" className="inline-block">
            <div className="relative w-28 h-7">
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

          {/* 링크 그룹 */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            <Link href="/products" className="text-white/50 hover:text-white transition-colors">
              전체 상품
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/products?sort=latest" className="text-white/50 hover:text-white transition-colors">
              신상품
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/products?sort=popular" className="text-white/50 hover:text-white transition-colors">
              인기 상품
            </Link>
            <span className="text-white/20">·</span>
            <a
              href={`${SELLER_URL}/register`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
            >
              판매자 등록
            </a>
            <span className="text-white/20">·</span>
            <a
              href={`${IR_URL}/how-it-works`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
            >
              서비스 안내
            </a>
          </div>
        </div>

        {/* 하단: 회사 정보 */}
        <div className="pt-4 text-center space-y-1.5">
          <p className="text-white/40 text-xs">
            <span className="font-medium">인포24</span>
            <span className="mx-2 text-white/20">|</span>
            사업자등록번호: 514-24-41035
            <span className="mx-2 text-white/20">|</span>
            대표자명: 박건우
          </p>
          <p className="text-white/30 text-[11px]">
            통신판매업신고: 제 2022-대구수성구-0486 호
            <span className="mx-2 text-white/20">|</span>
            주소: 대구광역시 수성구 국채보상로186길 51, 2층
          </p>
          <p className="text-white/20 text-[10px] pt-1">
            Copyright © 2025 인포24. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

