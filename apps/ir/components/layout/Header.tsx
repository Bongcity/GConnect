'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ArrowRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: '소개', href: '/#about', matchPath: '/', section: 'about' },
  { name: '동작 방식', href: '/how-it-works', matchPath: '/how-it-works', section: null },
  { name: '보안', href: '/security', matchPath: '/security', section: null },
  { name: '요금', href: '/#pricing', matchPath: '/', section: 'pricing' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about');
  const pathname = usePathname();

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 섹션 감지 (Intersection Observer)
  useEffect(() => {
    // 메인 페이지가 아니면 섹션 감지 안함
    if (pathname !== '/') {
      setActiveSection('');
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // 화면 중앙 부근에서 감지
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setActiveSection(sectionId);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 관찰할 섹션들
    const sections = ['about', 'pricing'];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  const isActive = (item: typeof navigation[0]) => {
    // 페이지 기반 메뉴 (동작 방식, 보안)
    if (item.section === null) {
      return pathname === item.matchPath;
    }
    
    // 섹션 기반 메뉴 (소개, 요금)
    if (pathname === '/' && item.section) {
      return activeSection === item.section;
    }
    
    return false;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-card border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-custom" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex lg:flex-1">
            <Link href="/" className="group -m-1.5 p-1.5 flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                {/* 그라디언트 마스크 로고 */}
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
              </div>
              <span className="px-2 py-0.5 rounded-md text-xs font-bold text-brand-neon/80 bg-brand-neon/10 border border-brand-neon/20 group-hover:bg-brand-neon/20 transition-colors">
                IR
              </span>
            </Link>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-neon/30 transition-all"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">메뉴 열기</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* 데스크톱 메뉴 */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative group text-sm font-semibold leading-6 transition-colors px-3 py-2 ${
                    active ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className={`absolute inset-0 rounded-lg transition-colors ${
                    active ? 'bg-white/10' : 'bg-white/0 group-hover:bg-white/5'
                  }`} />
                  <div className={`absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-brand-neon to-brand-cyan transition-transform origin-left ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* 우측 CTA 버튼 */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
            {/* 로그인 버튼 */}
            <Link
              href="https://seller.gconnect.kr"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/90 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-neon/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <UserCircleIcon className="w-4 h-4 group-hover:text-brand-neon transition-colors" />
              <span className="group-hover:text-white transition-colors">로그인</span>
            </Link>

            {/* 무료 시작하기 버튼 */}
            <Link 
              href="#inquiry" 
              className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-brand-navy bg-gradient-to-r from-brand-neon to-brand-cyan hover:shadow-lg hover:shadow-brand-neon/50 transition-all duration-300 hover:scale-105 hover:gap-3"
            >
              <span>무료 시작</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-brand-navy px-6 py-6 sm:max-w-sm glass-card">
            <div className="flex items-center justify-between">
              <Link href="/" className="group -m-1.5 p-1.5 flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan blur-lg opacity-20" />
                  {/* 그라디언트 마스크 로고 */}
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
                </div>
                <span className="px-2 py-0.5 rounded-md text-xs font-bold text-brand-neon/80 bg-brand-neon/10 border border-brand-neon/20">
                  IR
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-xl p-2.5 text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">메뉴 닫기</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="space-y-1 py-6">
                  {navigation.map((item) => {
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group -mx-3 flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold leading-7 transition-all ${
                          active 
                            ? 'text-white bg-white/10 border-l-2 border-brand-neon' 
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{item.name}</span>
                        <ArrowRightIcon className={`w-4 h-4 transition-all ${
                          active 
                            ? 'text-brand-neon translate-x-1' 
                            : 'text-white/30 group-hover:text-brand-neon group-hover:translate-x-1'
                        }`} />
                      </Link>
                    );
                  })}
                </div>
                <div className="py-6 space-y-3">
                  {/* 모바일 로그인 버튼 */}
                  <Link
                    href="https://seller.gconnect.kr"
                    className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white/90 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-neon/30 backdrop-blur-sm transition-all"
                  >
                    <UserCircleIcon className="w-5 h-5 group-hover:text-brand-neon transition-colors" />
                    <span className="group-hover:text-white transition-colors">로그인</span>
                  </Link>

                  {/* 모바일 무료 시작 버튼 */}
                  <Link
                    href="#inquiry"
                    className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-brand-navy bg-gradient-to-r from-brand-neon to-brand-cyan hover:shadow-lg hover:shadow-brand-neon/50 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>무료 시작하기</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

