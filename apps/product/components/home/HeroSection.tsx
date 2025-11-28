'use client';

import { MagnifyingGlassIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-navy via-brand-navy/95 to-brand-navy section-padding">
      {/* 배경 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-neon/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* 배지 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-neon/10 border border-brand-neon/20 mb-8">
            <SparklesIcon className="w-5 h-5 text-brand-neon" />
            <span className="text-brand-neon font-semibold">네이버 스마트스토어 상품 검색</span>
          </div>

          {/* 메인 타이틀 */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            원하는 상품을
            <br />
            <span className="gradient-text mt-4 inline-block">한눈에 찾아보세요</span>
          </h1>

          {/* 서브 타이틀 */}
          <p className="text-xl text-white/70 mb-12 leading-relaxed">
            수천 개의 네이버 스마트스토어 상품을 GConnect에서 검색하고
            <br />
            최적의 가격으로 구매하세요
          </p>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="glass-card p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingBagIcon className="w-6 h-6 text-brand-neon" />
                <p className="text-3xl font-bold text-white">1,000+</p>
              </div>
              <p className="text-white/60 text-sm">등록 상품</p>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MagnifyingGlassIcon className="w-6 h-6 text-brand-cyan" />
                <p className="text-3xl font-bold text-white">100+</p>
              </div>
              <p className="text-white/60 text-sm">제휴 스토어</p>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
                <p className="text-3xl font-bold text-white">24/7</p>
              </div>
              <p className="text-white/60 text-sm">실시간 업데이트</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

