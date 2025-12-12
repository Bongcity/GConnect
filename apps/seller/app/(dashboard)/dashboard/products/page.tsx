'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
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
  googleImpressions?: number;
  googleClicks?: number;
}

interface SubscriptionData {
  plan: {
    displayName: string;
    maxProducts: number;
  };
  usage: {
    currentProducts: number;
    maxProducts: number;
    remainingSlots: number;
    usagePercentage: number;
  };
  needsUpgrade: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'google-exposed' | 'google-not-exposed'>('all');
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

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
    fetchSubscription();
  }, []);

  // 구독 정보 조회
  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

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
      (filterStatus === 'inactive' && !product.isActive) ||
      (filterStatus === 'google-exposed' && product.isGoogleExposed) ||
      (filterStatus === 'google-not-exposed' && !product.isGoogleExposed);
    return matchesSearch && matchesFilter;
  });

  // 통계 계산
  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    inactive: products.filter(p => !p.isActive).length,
    googleExposed: products.filter(p => p.isGoogleExposed).length,
    googleNotExposed: products.filter(p => !p.isGoogleExposed).length,
  };

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
      {/* 플랜 제한 알림 */}
      {subscriptionData && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-brand-neon/10 to-brand-cyan/10 border border-brand-neon/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {subscriptionData.plan.displayName} 플랜
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white/70">
                  상품 등록: <span className="text-white font-semibold">{subscriptionData.usage.currentProducts}</span> / {subscriptionData.usage.maxProducts}
                </span>
                <span className="text-white/70">
                  남은 슬롯: <span className={subscriptionData.usage.remainingSlots <= 10 ? 'text-red-400 font-semibold' : 'text-brand-neon font-semibold'}>
                    {subscriptionData.usage.remainingSlots}개
                  </span>
                </span>
              </div>
            </div>
            {subscriptionData.needsUpgrade && (
              <Link href="/dashboard/settings" className="btn-neon text-sm">
                플랜 업그레이드
              </Link>
            )}
          </div>
          {subscriptionData.needsUpgrade && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">
                ⚠️ 상품 동기화 한도에 도달했습니다. 네이버에서 더 많은 상품을 가져오려면 플랜을 업그레이드하세요.
              </p>
            </div>
          )}
        </div>
      )}

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
              className="btn-neon inline-flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? '동기화 중...' : '네이버 상품 가져오기'}
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setFilterStatus('all')}>
            <p className="text-sm text-white/60 mb-1">전체 상품</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setFilterStatus('active')}>
            <p className="text-sm text-white/60 mb-1">활성 상품</p>
            <p className="text-3xl font-bold text-green-400">{stats.active}</p>
          </div>
          <div className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setFilterStatus('inactive')}>
            <p className="text-sm text-white/60 mb-1">비활성 상품</p>
            <p className="text-3xl font-bold text-red-400">{stats.inactive}</p>
          </div>
          <div className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setFilterStatus('google-exposed')}>
            <p className="text-sm text-white/60 mb-1">구글 노출</p>
            <p className="text-3xl font-bold text-brand-cyan">{stats.googleExposed}</p>
          </div>
          <div className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setFilterStatus('google-not-exposed')}>
            <p className="text-sm text-white/60 mb-1">구글 미노출</p>
            <p className="text-3xl font-bold text-orange-400">{stats.googleNotExposed}</p>
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
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-brand-neon text-brand-navy'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              전체상품
              <span className="ml-2 text-xs opacity-70">({stats.total})</span>
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-brand-neon text-brand-navy'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              활성 상품
              <span className="ml-2 text-xs opacity-70">({stats.active})</span>
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'inactive'
                  ? 'bg-brand-neon text-brand-navy'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              비활성 상품
              <span className="ml-2 text-xs opacity-70">({stats.inactive})</span>
            </button>
            <button
              onClick={() => setFilterStatus('google-exposed')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'google-exposed'
                  ? 'bg-brand-neon text-brand-navy'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              구글 노출
              <span className="ml-2 text-xs opacity-70">({stats.googleExposed})</span>
            </button>
            <button
              onClick={() => setFilterStatus('google-not-exposed')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'google-not-exposed'
                  ? 'bg-brand-neon text-brand-navy'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              구글 미노출
              <span className="ml-2 text-xs opacity-70">({stats.googleNotExposed})</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <a
              key={product.id}
              href={`https://www.gconnect.kr/products/SELLER/${product.id}/${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover p-4 group"
            >
              {/* 상품 이미지 */}
              <div className="aspect-square rounded-xl bg-white/5 mb-3 overflow-hidden">
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
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2 group-hover:text-brand-neon transition-colors">
                  {product.name}
                </h3>
                {product.categoryPath && (
                  <p className="text-xs text-white/50 mb-1 line-clamp-1">{product.categoryPath}</p>
                )}
              </div>

              {/* 가격 */}
              <div className="mb-3">
                {product.salePrice && product.salePrice < product.price ? (
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-brand-neon">
                      {product.salePrice.toLocaleString()}원
                    </span>
                    <span className="text-xs text-white/50 line-through">
                      {product.price.toLocaleString()}원
                    </span>
                  </div>
                ) : (
                  <span className="text-base font-bold text-white">
                    {product.price.toLocaleString()}원
                  </span>
                )}
              </div>

              {/* 상태 배지 */}
              <div className="flex flex-wrap gap-1 mb-2">
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

              {/* Google Search Console 통계 */}
              {(product.googleImpressions !== undefined && product.googleImpressions > 0) || 
               (product.googleClicks !== undefined && product.googleClicks > 0) ? (
                <div className="flex gap-3 mb-2 text-xs">
                  <div className="flex items-center gap-1 text-white/60">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{product.googleImpressions?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-brand-cyan">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <span>{product.googleClicks?.toLocaleString() || 0}</span>
                  </div>
                </div>
              ) : null}

              {/* 재고 */}
              {product.stockQuantity !== null && product.stockQuantity !== undefined && (
                <p className="text-xs text-white/60">재고: {product.stockQuantity}개</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

