'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Category {
  name: string;
  cid: string;
  productCount: number;
}

interface AutoCompleteKeyword {
  keyword: string;
  rank: number | null;
  category: string | null;
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autoCompleteKeywords, setAutoCompleteKeywords] = useState<AutoCompleteKeyword[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const router = useRouter();

  // 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?limit=10');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('카테고리 로딩 실패:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        setShowAutoComplete(false);
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  // 자동완성 키워드 클릭
  const handleAutoCompleteClick = (keyword: string) => {
    setSearchQuery(keyword);
    setShowAutoComplete(false);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  // 자동완성 검색어 로드
  useEffect(() => {
    const fetchAutoComplete = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setAutoCompleteKeywords([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/autocomplete?keyword=${encodeURIComponent(searchQuery)}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setAutoCompleteKeywords(data.keywords || []);
        }
      } catch (error) {
        console.error('자동완성 검색어 로딩 실패:', error);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchAutoComplete();
    }, 300); // 300ms 디바운스

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-brand-navy/80 backdrop-blur-xl border-b border-white/10">
      <div className="container-custom">
        {/* 상단 바: 로고, 검색, 메뉴 */}
        <div className="flex items-center justify-between h-16 md:h-20 gap-2 md:gap-4">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-1 md:gap-2 group flex-shrink-0">
            <div className="relative w-24 md:w-32 h-6 md:h-8">
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
            <span className="hidden sm:inline px-2 py-0.5 rounded-md text-xs font-bold text-brand-neon/80 bg-brand-neon/10 border border-brand-neon/20">
              SHOP
            </span>
          </Link>

          {/* 검색바 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 md:mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowAutoComplete(true)}
                onBlur={() => setTimeout(() => setShowAutoComplete(false), 200)}
                placeholder="상품 검색..."
                className="w-full px-4 md:px-6 py-2 md:py-3 pl-10 md:pl-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white text-sm md:text-base placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              />
              <MagnifyingGlassIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-white/40" />
              <button
                type="submit"
                className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-1.5 md:py-2 bg-gradient-to-r from-brand-neon to-brand-cyan text-brand-navy text-sm md:text-base font-bold rounded-full hover:shadow-lg hover:shadow-brand-neon/50 transition-all"
              >
                검색
              </button>

              {/* 자동완성 드롭다운 */}
              {showAutoComplete && autoCompleteKeywords.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-brand-navy/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-black/20 overflow-hidden z-50">
                  <div className="py-2">
                    {autoCompleteKeywords.map((kw, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAutoCompleteClick(kw.keyword)}
                        className="w-full px-4 md:px-6 py-2 md:py-3 text-left text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 text-sm md:text-base"
                      >
                        <MagnifyingGlassIcon className="w-4 h-4 text-white/40 flex-shrink-0" />
                        <span className="flex-1">{kw.keyword}</span>
                        {kw.rank && kw.rank <= 10 && (
                          <span className="px-2 py-0.5 bg-brand-neon/20 text-brand-neon text-xs font-bold rounded flex-shrink-0">
                            #{kw.rank}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* 네비게이션 */}
          <nav className="hidden lg:flex items-center gap-4 lg:gap-6 flex-shrink-0">
            <Link
              href="/products"
              className="text-white/80 hover:text-white transition-colors font-medium whitespace-nowrap text-sm lg:text-base"
            >
              전체 상품
            </Link>
            <Link
              href="/favorites"
              className="text-white/80 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
              title="좋아요 상품"
            >
              <HeartIcon className="w-5 h-5" />
              <span className="hidden xl:inline text-sm lg:text-base font-medium">좋아요</span>
            </Link>
            <Link
              href="/recent"
              className="text-white/80 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
              title="최근 본 상품"
            >
              <ClockIcon className="w-5 h-5" />
              <span className="hidden xl:inline text-sm lg:text-base font-medium">최근 본</span>
            </Link>
            <Link
              href="https://gconnect.co.kr"
              className="text-white/80 hover:text-white transition-colors font-medium whitespace-nowrap text-sm lg:text-base"
              target="_blank"
            >
              판매자 등록
            </Link>
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button
            type="button"
            className="lg:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* 카테고리 네비게이션 - 데스크톱 */}
        {categories.length > 0 && (
          <div className="hidden lg:block border-t border-white/5 py-3">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <Link
                href="/products"
                className="text-white/70 hover:text-brand-neon text-sm font-medium whitespace-nowrap transition-colors"
              >
                전체
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.cid}
                  href={`/products?category=${category.cid}`}
                  className="text-white/70 hover:text-brand-neon text-sm font-medium whitespace-nowrap transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4">
            <div className="space-y-3">
              {/* 기본 네비게이션 */}
              <div className="space-y-2 pb-3 border-b border-white/10">
                <Link
                  href="/products"
                  className="block text-white/80 hover:text-white py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  전체 상품
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center gap-2 text-white/80 hover:text-white py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HeartIcon className="w-5 h-5" />
                  좋아요 상품
                </Link>
                <Link
                  href="/recent"
                  className="flex items-center gap-2 text-white/80 hover:text-white py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ClockIcon className="w-5 h-5" />
                  최근 본 상품
                </Link>
                <Link
                  href="https://gconnect.co.kr"
                  className="block text-white/80 hover:text-white py-2 transition-colors"
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  판매자 등록
                </Link>
              </div>

              {/* 카테고리 목록 */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-white/60 uppercase mb-2">
                    인기 카테고리
                  </div>
                  {categories.map((category) => (
                    <Link
                      key={category.cid}
                      href={`/products?category=${category.cid}`}
                      className="block text-white/70 hover:text-brand-neon py-2 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

