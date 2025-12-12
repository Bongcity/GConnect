'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClockIcon, ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { recentStorage } from '@/lib/utils/localStorage';
import type { UnifiedProduct } from '@/types/product';

export default function RecentProductsPage() {
  const [recentProducts, setRecentProducts] = useState<UnifiedProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadRecentProducts();
  }, []);

  const loadRecentProducts = () => {
    const products = recentStorage.getAll();
    setRecentProducts(products);
  };

  const handleClearAll = () => {
    if (window.confirm('모든 최근 본 상품을 삭제하시겠습니까?')) {
      recentStorage.clear();
      loadRecentProducts();
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 section-padding">
          <div className="container-custom">
            <div className="text-center py-20">
              <div className="animate-pulse">
                <div className="h-8 bg-white/10 rounded w-48 mx-auto mb-4"></div>
                <div className="h-4 bg-white/5 rounded w-32 mx-auto"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 section-padding">
        <div className="container-custom">
          {/* 헤더 */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <ClockIcon className="w-8 h-8 text-brand-neon" />
                <h1 className="heading-1">최근 본 상품</h1>
              </div>
              
              {recentProducts.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                  전체 삭제
                </button>
              )}
            </div>
            <p className="text-white/60 text-lg">
              {recentProducts.length === 0
                ? '최근 본 상품이 없습니다'
                : `최근 ${recentProducts.length}개의 상품을 확인했습니다`}
            </p>
          </div>

          {/* 상품 목록 */}
          {recentProducts.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <ClockIcon className="w-20 h-20 text-white/20 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                최근 본 상품이 없습니다
              </h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                상품을 둘러보시면 여기에 자동으로 표시됩니다.
                <br />
                최대 20개까지 저장되며, 가장 최근에 본 상품이 먼저 표시됩니다.
              </p>
              <Link
                href="/products"
                className="btn-primary inline-flex items-center gap-2"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                상품 둘러보기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentProducts.map((product) => (
                <div key={product.id} className="[&_.glass-card]:border-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

