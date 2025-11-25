'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  stockQuantity?: number;
  isActive: boolean;
  isGoogleExposed: boolean;
  syncStatus: string;
  categoryPath?: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // 상품 목록 조회
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 상품 동기화
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/products/sync', {
        method: 'POST',
      });
      
      if (response.ok) {
        await fetchProducts();
        alert('상품 동기화가 완료되었습니다.');
      } else {
        alert('동기화에 실패했습니다.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('동기화 중 오류가 발생했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 필터링된 상품
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && product.isActive) ||
      (filterStatus === 'inactive' && !product.isActive);
    return matchesSearch && matchesFilter;
  });

  // 동기화 상태 아이콘
  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'SYNCED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircleIcon className="w-3 h-3" />
            동기화됨
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircleIcon className="w-3 h-3" />
            오류
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <ClockIcon className="w-3 h-3" />
            대기중
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">상품 관리</h1>
            <p className="text-white/60">네이버 스마트스토어 상품을 관리하고 구글에 노출하세요</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? '동기화 중...' : '상품 동기화'}
            </button>
            <Link href="/dashboard/products/new" className="btn-neon inline-flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              상품 추가
            </Link>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <p className="text-sm text-white/60 mb-1">전체 상품</p>
            <p className="text-3xl font-bold text-white">{products.length}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-white/60 mb-1">활성 상품</p>
            <p className="text-3xl font-bold text-green-400">
              {products.filter((p) => p.isActive).length}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-white/60 mb-1">구글 노출</p>
            <p className="text-3xl font-bold text-brand-cyan">
              {products.filter((p) => p.isGoogleExposed).length}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-white/60 mb-1">동기화 대기</p>
            <p className="text-3xl font-bold text-yellow-400">
              {products.filter((p) => p.syncStatus === 'PENDING').length}
            </p>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="상품명 검색..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
            />
          </div>

          {/* 필터 */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-brand-neon text-brand-navy'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-brand-neon text-brand-navy'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              활성
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'inactive'
                  ? 'bg-brand-neon text-brand-navy'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              비활성
            </button>
          </div>
        </div>
      </div>

      {/* 상품 목록 */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-white/40 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">상품이 없습니다</h3>
          <p className="text-white/60 mb-6">
            {searchTerm
              ? '검색 결과가 없습니다.'
              : '상품을 동기화하거나 직접 추가해보세요.'}
          </p>
          {!searchTerm && (
            <div className="flex gap-3 justify-center">
              <button onClick={handleSync} className="btn-secondary">
                상품 동기화
              </button>
              <Link href="/dashboard/products/new" className="btn-neon">
                상품 추가
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/products/${product.id}`}
              className="glass-card-hover p-6 group"
            >
              {/* 상품 이미지 */}
              <div className="aspect-square rounded-xl bg-white/5 mb-4 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* 상품 정보 */}
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-brand-neon transition-colors">
                  {product.name}
                </h3>
                {product.categoryPath && (
                  <p className="text-xs text-white/50 mb-2">{product.categoryPath}</p>
                )}
              </div>

              {/* 가격 */}
              <div className="mb-4">
                {product.salePrice && product.salePrice < product.price ? (
                  <div>
                    <span className="text-lg font-bold text-brand-neon">
                      {product.salePrice.toLocaleString()}원
                    </span>
                    <span className="ml-2 text-sm text-white/50 line-through">
                      {product.price.toLocaleString()}원
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-white">
                    {product.price.toLocaleString()}원
                  </span>
                )}
              </div>

              {/* 상태 배지 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {getSyncStatusBadge(product.syncStatus)}
                {product.isGoogleExposed && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                    구글 노출
                  </span>
                )}
                {!product.isActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-white/10 text-white/60 border border-white/20">
                    비활성
                  </span>
                )}
              </div>

              {/* 재고 */}
              {product.stockQuantity !== null && product.stockQuantity !== undefined && (
                <p className="text-sm text-white/60">재고: {product.stockQuantity}개</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

