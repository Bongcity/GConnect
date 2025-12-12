import Link from 'next/link';

const SELLER_URL = process.env.NEXT_PUBLIC_SELLER_URL || 'https://seller.gconnect.kr';
const IR_URL = process.env.NEXT_PUBLIC_IR_URL || 'https://gconnect.kr';

export default function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
          {/* 브랜드 */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="relative w-36 h-9">
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
            <p className="text-white/60 text-sm leading-relaxed">
              네이버 스마트스토어 상품을<br />한눈에
            </p>
          </div>

          {/* 쇼핑 */}
          <div className="md:col-span-1">
            <h3 className="text-white font-bold mb-4 text-base">쇼핑</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-white/60 hover:text-white text-sm transition-colors block">
                  전체 상품
                </Link>
              </li>
              <li>
                <Link href="/products?sort=latest" className="text-white/60 hover:text-white text-sm transition-colors block">
                  신상품
                </Link>
              </li>
              <li>
                <Link href="/products?sort=popular" className="text-white/60 hover:text-white text-sm transition-colors block">
                  인기 상품
                </Link>
              </li>
            </ul>
          </div>

          {/* 판매자 */}
          <div className="md:col-span-1">
            <h3 className="text-white font-bold mb-4 text-base">판매자</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`${SELLER_URL}/register`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  판매자 등록
                </a>
              </li>
              <li>
                <a
                  href={`${IR_URL}/how-it-works`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white text-sm transition-colors block"
                >
                  서비스 안내
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 회사 정보 */}
        <div className="pt-8 border-t border-white/10">
          <div className="text-white/40 text-xs leading-relaxed text-center">
            <div className="space-y-2">
              <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                <span>상호: 인포24</span>
                <span className="text-white/20">|</span>
                <span>사업자등록번호: 514-24-41035</span>
                <span className="text-white/20">|</span>
                <span>대표자명: 박건우</span>
              </p>
              <p>
                통신판매업신고: 제 2022-대구수성구-0486 호
              </p>
              <p>
                주소: 대구광역시 수성구 국채보상로186길 51, 2층
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-white/30 font-medium">
                Copyright by 인포24 . All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

