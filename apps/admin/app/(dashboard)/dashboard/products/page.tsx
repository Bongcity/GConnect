'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  user: {
    email: string;
    shopName: string | null;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `/api/admin/products?status=${filter}&search=${search}`
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
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
          {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === status
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              {status === 'ALL' ? '전체' : status}
            </button>
          ))}
        </div>
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-white/60">
            상품이 없습니다.
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="glass-card overflow-hidden group">
              {/* 상품 이미지 */}
              <div className="relative h-48 bg-white/5">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/40">
                    이미지 없음
                  </div>
                )}
              </div>

              {/* 상품 정보 */}
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-brand-neon font-bold mb-2">
                  {product.price.toLocaleString()}원
                </p>
                <div className="text-sm text-white/60 mb-3">
                  <p>판매자: {product.user.shopName || product.user.email}</p>
                  <p>등록일: {format(new Date(product.createdAt), 'yyyy-MM-dd')}</p>
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all text-sm font-medium"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">전체 상품</p>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">활성 상품</p>
          <p className="text-3xl font-bold">
            {products.filter((p) => p.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">비활성 상품</p>
          <p className="text-3xl font-bold">
            {products.filter((p) => p.status === 'INACTIVE').length}
          </p>
        </div>
      </div>
    </div>
  );
}

