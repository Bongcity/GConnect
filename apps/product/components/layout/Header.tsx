'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-navy/80 backdrop-blur-xl border-b border-white/10">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
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
            <span className="px-2 py-0.5 rounded-md text-xs font-bold text-brand-neon/80 bg-brand-neon/10 border border-brand-neon/20">
              SHOP
            </span>
          </Link>

          {/* 검색바 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="상품 검색..."
                className="w-full px-6 py-3 pl-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-brand-neon to-brand-cyan text-brand-navy font-bold rounded-full hover:shadow-lg hover:shadow-brand-neon/50 transition-all"
              >
                검색
              </button>
            </div>
          </form>

          {/* 네비게이션 */}
          <nav className="flex items-center gap-6">
            <Link
              href="/products"
              className="text-white/80 hover:text-white transition-colors font-medium"
            >
              전체 상품
            </Link>
            <Link
              href="https://gconnect.co.kr"
              className="text-white/80 hover:text-white transition-colors font-medium"
              target="_blank"
            >
              판매자 등록
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

