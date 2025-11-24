import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 브랜드 */}
          <div>
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
            <p className="text-white/60 text-sm">
              네이버 스마트스토어 상품을 한눈에
            </p>
          </div>

          {/* 쇼핑 */}
          <div>
            <h3 className="text-white font-semibold mb-4">쇼핑</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-white/60 hover:text-white text-sm transition-colors">
                  전체 상품
                </Link>
              </li>
              <li>
                <Link href="/products?sort=latest" className="text-white/60 hover:text-white text-sm transition-colors">
                  신상품
                </Link>
              </li>
              <li>
                <Link href="/products?sort=popular" className="text-white/60 hover:text-white text-sm transition-colors">
                  인기 상품
                </Link>
              </li>
            </ul>
          </div>

          {/* 판매자 */}
          <div>
            <h3 className="text-white font-semibold mb-4">판매자</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://gconnect.co.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  판매자 등록
                </a>
              </li>
              <li>
                <a
                  href="https://gconnect.co.kr/how-it-works"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  서비스 안내
                </a>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h3 className="text-white font-semibold mb-4">고객 지원</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@gconnect.co.kr" className="text-white/60 hover:text-white text-sm transition-colors">
                  이메일 문의
                </a>
              </li>
              <li>
                <span className="text-white/60 text-sm">
                  평일 09:00-18:00
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-white/40 text-sm text-center">
            © {new Date().getFullYear()} GConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

