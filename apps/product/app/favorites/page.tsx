'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { favoriteStorage } from '@/lib/utils/localStorage';
import type { UnifiedProduct } from '@/types/product';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<UnifiedProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const products = favoriteStorage.getAll();
    setFavorites(products);
  };

  const handleRemove = (productId: string) => {
    favoriteStorage.remove(productId);
    loadFavorites();
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
            <div className="flex items-center gap-3 mb-3">
              <HeartIcon className="w-8 h-8 text-brand-neon" />
              <h1 className="heading-1">좋아요 상품</h1>
            </div>
            <p className="text-white/60 text-lg">
              {favorites.length === 0
                ? '좋아요한 상품이 없습니다'
                : `총 ${favorites.length}개의 상품`}
            </p>
          </div>

          {/* 상품 목록 */}
          {favorites.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <HeartIcon className="w-20 h-20 text-white/20 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                좋아요한 상품이 없습니다
              </h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                마음에 드는 상품을 찾아 좋아요를 눌러보세요.
                <br />
                나중에 쉽게 다시 찾아볼 수 있습니다.
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
              {favorites.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />
                  
                  {/* 제거 버튼 */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(product.id);
                    }}
                    className="absolute top-4 right-4 z-10 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="제거하기"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
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

