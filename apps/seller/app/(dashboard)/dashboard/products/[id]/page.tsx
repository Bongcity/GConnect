'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  stockQuantity?: number;
  isActive: boolean;
  isGoogleExposed: boolean;
  syncStatus: string;
  categoryPath?: string;
  naverProductId?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    price: 0,
    salePrice: 0,
    stockQuantity: 0,
    isActive: true,
  });

  // 상품 조회
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
          setEditData({
            name: data.product.name,
            description: data.product.description || '',
            price: data.product.price,
            salePrice: data.product.salePrice || 0,
            stockQuantity: data.product.stockQuantity || 0,
            isActive: data.product.isActive,
          });
        } else {
          alert('상품을 찾을 수 없습니다.');
          router.push('/dashboard/products');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // 상품 수정
  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        setIsEditing(false);
        alert('상품이 수정되었습니다.');
      } else {
        alert('상품 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('상품 수정 중 오류가 발생했습니다.');
    }
  };

  // 상품 삭제
  const handleDelete = async () => {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('상품이 삭제되었습니다.');
        router.push('/dashboard/products');
      } else {
        alert('상품 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-5xl">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          목록으로 돌아가기
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
            {product.categoryPath && (
              <p className="text-white/60">{product.categoryPath}</p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <PencilIcon className="w-5 h-5" />
              {isEditing ? '취소' : '수정'}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              <TrashIcon className="w-5 h-5" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 상품 이미지 */}
        <div className="glass-card p-6">
          <div className="aspect-square rounded-xl bg-white/5 overflow-hidden mb-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
                <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* 상태 배지 */}
          <div className="flex flex-wrap gap-2">
            {product.isActive ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm bg-green-500/10 text-green-400 border border-green-500/20">
                <CheckCircleIcon className="w-4 h-4" />
                활성
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm bg-white/10 text-white/60 border border-white/20">
                <XCircleIcon className="w-4 h-4" />
                비활성
              </span>
            )}
            {product.isGoogleExposed && (
              <span className="px-3 py-1 rounded-lg text-sm bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                구글 노출
              </span>
            )}
            {product.syncStatus === 'SYNCED' && (
              <span className="px-3 py-1 rounded-lg text-sm bg-brand-neon/10 text-brand-neon border border-brand-neon/20">
                동기화됨
              </span>
            )}
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="glass-card p-6">
          {isEditing ? (
            /* 수정 모드 */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  상품명 *
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  설명
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    가격 *
                  </label>
                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    할인가
                  </label>
                  <input
                    type="number"
                    value={editData.salePrice}
                    onChange={(e) => setEditData({ ...editData, salePrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  재고
                </label>
                <input
                  type="number"
                  value={editData.stockQuantity}
                  onChange={(e) => setEditData({ ...editData, stockQuantity: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editData.isActive}
                  onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="isActive" className="text-white">
                  상품 활성화
                </label>
              </div>

              <button onClick={handleUpdate} className="w-full btn-neon">
                저장하기
              </button>
            </div>
          ) : (
            /* 보기 모드 */
            <div className="space-y-6">
              {/* 가격 */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-2">가격</h3>
                <div>
                  {product.salePrice && product.salePrice < product.price ? (
                    <>
                      <span className="text-3xl font-bold text-brand-neon">
                        {product.salePrice.toLocaleString()}원
                      </span>
                      <span className="ml-3 text-lg text-white/50 line-through">
                        {product.price.toLocaleString()}원
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {product.price.toLocaleString()}원
                    </span>
                  )}
                </div>
              </div>

              {/* 설명 */}
              {product.description && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">설명</h3>
                  <p className="text-white/80">{product.description}</p>
                </div>
              )}

              {/* 재고 */}
              {product.stockQuantity !== null && product.stockQuantity !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">재고</h3>
                  <p className="text-white/80">{product.stockQuantity}개</p>
                </div>
              )}

              {/* 네이버 상품 ID */}
              {product.naverProductId && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">네이버 상품 ID</h3>
                  <p className="text-white/80 font-mono text-sm">{product.naverProductId}</p>
                </div>
              )}

              {/* 동기화 정보 */}
              {product.lastSyncedAt && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">마지막 동기화</h3>
                  <p className="text-white/80">
                    {new Date(product.lastSyncedAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

