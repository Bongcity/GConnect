import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  company: [
    { name: '회사 소개', href: '#about' },
    { name: '동작 방식', href: '/how-it-works' },
    { name: '보안 정책', href: '/security' },
    { name: '요금제', href: '#pricing' },
  ],
  legal: [
    { name: '이용약관', href: '/terms' },
    { name: '개인정보처리방침', href: '/privacy' },
  ],
  resources: [
    { name: '상품 사이트', href: 'https://www.gconnect.kr' },
    { name: '셀러 로그인', href: 'https://seller.gconnect.kr' },
    { name: '고객센터', href: '#inquiry' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy-light border-t border-white/10">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 브랜드 섹션 */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <div className="relative w-40 h-10">
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
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              네이버 스마트스토어를<br />
              구글에 자동으로 연결하는<br />
              SEO 플랫폼
            </p>
            <div className="mt-6">
              <p className="text-xs text-white/40">
                문의: support@gconnect.kr
              </p>
            </div>
          </div>

          {/* 링크 섹션 */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-3 lg:grid-cols-3">
            {/* 회사 */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                회사
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 법적 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                법적 정보
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 리소스 */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                리소스
              </h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-white/40 text-center lg:text-left">
            &copy; {currentYear} GConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

