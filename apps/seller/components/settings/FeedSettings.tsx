'use client';

import { useState, useEffect } from 'react';
import { LinkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function FeedSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [feedUrl, setFeedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    feedTitle: '',
    feedDescription: '',
    storeUrl: '',
    storeName: '',
    merchantId: '',
    includeInactive: false,
    autoUpdate: true,
    updateFrequency: 24,
  });

  // 피드 설정 불러오기
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/feed/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setFormData({
              feedTitle: data.settings.feedTitle || '',
              feedDescription: data.settings.feedDescription || '',
              storeUrl: data.settings.storeUrl || '',
              storeName: data.settings.storeName || '',
              merchantId: data.settings.merchantId || '',
              includeInactive: data.settings.includeInactive || false,
              autoUpdate: data.settings.autoUpdate !== undefined ? data.settings.autoUpdate : true,
              updateFrequency: data.settings.updateFrequency || 24,
            });
          }
          if (data.feedUrl) {
            setFeedUrl(data.feedUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch feed settings:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/feed/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '저장에 실패했습니다.');
      }

      setMessage({ type: 'success', text: '피드 설정이 저장되었습니다.' });
      if (data.feedUrl) {
        setFeedUrl(data.feedUrl);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <h2 className="text-2xl font-bold text-white mb-2">Google Shopping 피드</h2>
        <p className="text-white/60">
          Google Merchant Center에 등록할 상품 피드를 설정하세요
        </p>
      </div>

      {/* 피드 URL (저장 후 표시) */}
      {feedUrl && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <h3 className="text-sm font-semibold text-green-400 mb-2">✓ 피드가 생성되었습니다!</h3>
          <p className="text-xs text-white/70 mb-3">아래 URL을 Google Merchant Center에 등록하세요:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              <code className="text-sm text-brand-neon break-all">{feedUrl}</code>
            </div>
            <button
              onClick={copyToClipboard}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  복사됨!
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  복사
                </>
              )}
            </button>
          </div>
        </div>
      )}

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
        {/* 피드 제목 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            피드 제목 *
          </label>
          <input
            type="text"
            value={formData.feedTitle}
            onChange={(e) => setFormData({ ...formData, feedTitle: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
            placeholder="예: 내 스마트스토어 상품 피드"
            required
          />
        </div>

        {/* 피드 설명 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            피드 설명
          </label>
          <textarea
            value={formData.feedDescription}
            onChange={(e) => setFormData({ ...formData, feedDescription: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors resize-none"
            placeholder="피드에 대한 간단한 설명"
          />
        </div>

        {/* 상점 URL */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            상점 URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="url"
              value={formData.storeUrl}
              onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="https://smartstore.naver.com/your-store"
            />
          </div>
        </div>

        {/* Google Merchant ID */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Google Merchant Center ID
          </label>
          <input
            type="text"
            value={formData.merchantId}
            onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
            placeholder="예: 123456789"
          />
          <p className="mt-1 text-xs text-white/50">
            Google Merchant Center에서 발급받은 ID (선택사항)
          </p>
        </div>

        {/* 옵션 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeInactive"
              checked={formData.includeInactive}
              onChange={(e) =>
                setFormData({ ...formData, includeInactive: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
            <label htmlFor="includeInactive" className="text-white">
              비활성 상품도 피드에 포함
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoUpdate"
              checked={formData.autoUpdate}
              onChange={(e) =>
                setFormData({ ...formData, autoUpdate: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
            <label htmlFor="autoUpdate" className="text-white">
              자동 업데이트 활성화
            </label>
          </div>
        </div>

        {/* 업데이트 주기 */}
        {formData.autoUpdate && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              업데이트 주기 (시간)
            </label>
            <select
              value={formData.updateFrequency}
              onChange={(e) =>
                setFormData({ ...formData, updateFrequency: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-neon/50 transition-colors"
            >
              <option value={1}>1시간마다</option>
              <option value={6}>6시간마다</option>
              <option value={12}>12시간마다</option>
              <option value={24}>24시간마다 (권장)</option>
            </select>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : '피드 생성/수정'}
          </button>
        </div>
      </form>

      {/* 안내 */}
      <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">
          📌 Google Merchant Center 등록 방법
        </h3>
        <ol className="text-xs text-white/70 space-y-1 ml-4 list-decimal">
          <li>위 양식을 작성하고 "피드 생성/수정" 클릭</li>
          <li>생성된 피드 URL 복사</li>
          <li>Google Merchant Center 접속: <a href="https://merchants.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-neon hover:underline">merchants.google.com</a></li>
          <li>"제품" → "피드" → "피드 추가" 선택</li>
          <li>복사한 URL을 "예약된 가져오기" 에 입력</li>
          <li>피드 이름 입력 후 저장</li>
        </ol>
      </div>
    </div>
  );
}


