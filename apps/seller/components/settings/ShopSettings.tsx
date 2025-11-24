'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BuildingStorefrontIcon, LinkIcon, PhoneIcon, IdentificationIcon } from '@heroicons/react/24/outline';

export default function ShopSettings() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    shopName: '',
    naverShopUrl: '',
    naverShopId: '',
    businessNumber: '',
    phone: '',
  });

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setFormData({
            shopName: data.shopName || '',
            naverShopUrl: data.naverShopUrl || '',
            naverShopId: data.naverShopId || '',
            businessNumber: data.businessNumber || '',
            phone: data.phone || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/shop-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '저장에 실패했습니다.');
      }

      setMessage({ type: 'success', text: '상점 설정이 저장되었습니다.' });
      
      // 세션 업데이트 (필요한 경우)
      await update();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="text-center py-8">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">상점 설정</h2>
        <p className="text-white/60">네이버 스마트스토어 정보를 입력하세요</p>
      </div>

      {/* 메시지 */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          <p
            className={`text-sm text-center ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 상점명 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            상점명 *
          </label>
          <div className="relative">
            <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="내 스마트스토어"
              required
            />
          </div>
        </div>

        {/* 네이버 스마트스토어 URL */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            네이버 스마트스토어 URL *
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="url"
              value={formData.naverShopUrl}
              onChange={(e) => setFormData({ ...formData, naverShopUrl: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="https://smartstore.naver.com/your-shop"
              required
            />
          </div>
          <p className="mt-1 text-xs text-white/50">
            예: https://smartstore.naver.com/your-shop
          </p>
        </div>

        {/* 스마트스토어 ID */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            스마트스토어 ID
          </label>
          <div className="relative">
            <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={formData.naverShopId}
              onChange={(e) => setFormData({ ...formData, naverShopId: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="your-shop"
            />
          </div>
          <p className="mt-1 text-xs text-white/50">
            URL의 마지막 부분 (선택사항)
          </p>
        </div>

        {/* 사업자 번호 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            사업자 번호
          </label>
          <input
            type="text"
            value={formData.businessNumber}
            onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
            placeholder="123-45-67890"
          />
          <p className="mt-1 text-xs text-white/50">선택사항</p>
        </div>

        {/* 연락처 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            연락처
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="010-1234-5678"
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

