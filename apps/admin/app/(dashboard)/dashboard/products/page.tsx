'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';

interface Product {
  id: string;
  product_name: string | null;
  sale_price: bigint | null;
  representative_product_image_url: string | null;
  enabled: boolean | null;
  google_in: number | null;
  product_url: string | null;
  store_name: string | null;
  created_at: string | null;
  updated_at: string | null;
  user: {
    id: string;
    email: string;
    shopName: string | null;
  };
}

interface Stats {
  total: number;
  googleEnabled: number;
  active: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, googleEnabled: 0, active: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'GOOGLE_ENABLED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1);
  }, [filter]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `/api/admin/products?status=${filter}&search=${search}`
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setStats(data.stats || { total: 0, googleEnabled: 0, active: 0 });
      }
    } catch (error) {
      console.error('상품 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('상품이 삭제되었습니다.');
        fetchProducts();
      }
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  // 필터링된 상품 목록
  const filteredProducts = products.filter((product) => {
    if (filter === 'ACTIVE') return product.enabled === true;
    if (filter === 'INACTIVE') return product.enabled === false;
    if (filter === 'GOOGLE_ENABLED') return product.google_in === 1;
    return true;
  });

  // 페이징 계산
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">상품 관리</h1>
        <p className="text-white/60">전체 등록 상품 조회 및 관리</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="상품명 또는 판매자 검색..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-red-400/50 focus:outline-none focus:ring-2 focus:ring-red-400/20"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 font-medium transition-colors"
          >
            검색
          </button>
        </div>

        <div className="flex gap-2">
          {[
            { value: 'ALL', label: '전체' },
            { value: 'ACTIVE', label: '활성' },
            { value: 'INACTIVE', label: '비활성' },
            { value: 'GOOGLE_ENABLED', label: 'Google 노출' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as any)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === item.value
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentProducts.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-white/60">
            상품이 없습니다.
          </div>
        ) : (
          currentProducts.map((product) => (
            <div key={product.id} className="glass-card overflow-hidden group">
              {/* 상품 이미지 */}
              <div className="relative h-48 bg-white/5">
                {product.representative_product_image_url ? (
                  <Image
                    src={product.representative_product_image_url}
                    alt={product.product_name || '상품'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/40">
                    이미지 없음
                  </div>
                )}
                
                {/* 상태 배지 */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {product.enabled ? (
                    <span className="px-2 py-1 rounded-lg bg-green-500/80 text-white text-xs font-semibold">
                      활성
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-lg bg-gray-500/80 text-white text-xs font-semibold">
                      비활성
                    </span>
                  )}
                  {product.google_in === 1 ? (
                    <span className="px-2 py-1 rounded-lg bg-blue-500/80 text-white text-xs font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                      </svg>
                      Google
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-lg bg-red-500/80 text-white text-xs font-semibold">
                      미노출
                    </span>
                  )}
                </div>
              </div>

              {/* 상품 정보 */}
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem]">
                  {product.product_name || '상품명 없음'}
                </h3>
                <p className="text-brand-neon font-bold mb-2">
                  {product.sale_price ? Number(product.sale_price).toLocaleString() : '0'}원
                </p>
                <div className="text-sm text-white/60 mb-3 space-y-1">
                  <p className="truncate">판매자: {product.user.shopName || product.user.email}</p>
                  <p className="truncate">상점: {product.store_name || '-'}</p>
                  <p>등록일: {product.created_at ? format(new Date(product.created_at), 'yyyy-MM-dd') : '-'}</p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  {product.product_url && (
                    <a
                      href={product.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-all text-sm font-medium text-center"
                    >
                      보기
                    </a>
                  )}
                  <button
                    onClick={() => deleteProduct(String(product.id))}
                    className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all text-sm font-medium"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이징 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            이전
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 3 ||
                page === currentPage + 3
              ) {
                return (
                  <span key={page} className="w-10 h-10 flex items-center justify-center text-white/40">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            다음
          </button>
        </div>
      )}

      {/* 통계 */}
      <div className="grid grid-cols-4 gap-6 mt-6">
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">전체 상품</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">활성 상품</p>
          <p className="text-3xl font-bold">{stats.active}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">비활성 상품</p>
          <p className="text-3xl font-bold">{stats.total - stats.active}</p>
        </div>
        <div className="glass-card p-6 border-2 border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
            <p className="text-blue-400 text-sm font-semibold">Google 노출</p>
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.googleEnabled}</p>
          <p className="text-xs text-white/40 mt-1">
            {stats.total > 0 ? Math.round((stats.googleEnabled / stats.total) * 100) : 0}% 노출률
          </p>
        </div>
      </div>
    </div>
  );
}

