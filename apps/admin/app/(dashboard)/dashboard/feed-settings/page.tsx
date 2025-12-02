'use client';

import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

interface FeedSetting {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    shopName: string;
  };
  feedTitle: string;
  feedUrl: string | null;
  storeUrl: string | null;
  merchantId: string | null;
  includeInactive: boolean;
  autoUpdate: boolean;
  updateFrequency: number;
  lastGenerated: string | null;
  totalProducts: number;
}

export default function FeedSettingsPage() {
  const [feedSettings, setFeedSettings] = useState<FeedSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedSettings();
  }, []);

  const fetchFeedSettings = async () => {
    try {
      const response = await fetch('/api/admin/feed-settings');
      if (response.ok) {
        const data = await response.json();
        setFeedSettings(data.feedSettings || []);
      }
    } catch (error) {
      console.error('Failed to fetch feed settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링된 피드 설정
  const filteredSettings = feedSettings.filter((setting) => {
    const matchesSearch =
      setting.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.user.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.feedTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // URL 복사
  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 통계
  const stats = {
    total: feedSettings.length,
    active: feedSettings.filter((s) => s.feedUrl).length,
    autoUpdate: feedSettings.filter((s) => s.autoUpdate).length,
    totalProducts: feedSettings.reduce((sum, s) => sum + s.totalProducts, 0),
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
        <h1 className="text-4xl font-bold text-white mb-2">Google 피드 관리</h1>
        <p className="text-white/60">
          사용자별 Google Shopping 피드 설정을 관리합니다
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">전체 피드</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">활성 피드</p>
          <p className="text-3xl font-bold text-green-400">{stats.active}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">자동 업데이트</p>
          <p className="text-3xl font-bold text-brand-cyan">{stats.autoUpdate}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">총 상품 수</p>
          <p className="text-3xl font-bold text-brand-neon">
            {stats.totalProducts.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 검색 */}
      <div className="glass-card p-6 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="사용자 이름, 이메일, 상점명, 피드 제목 검색..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50"
          />
        </div>
      </div>

      {/* 피드 목록 */}
      <div className="space-y-4">
        {filteredSettings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-white/60">피드 설정이 없습니다.</p>
          </div>
        ) : (
          filteredSettings.map((setting) => (
            <div key={setting.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {setting.feedTitle}
                    </h3>
                    {setting.feedUrl ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/70">
                      사용자: <span className="text-white">{setting.user.name}</span> (
                      {setting.user.email})
                    </p>
                    {setting.user.shopName && (
                      <p className="text-sm text-white/70">
                        상점: <span className="text-white">{setting.user.shopName}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      setting.autoUpdate
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}
                  >
                    {setting.autoUpdate ? '자동 업데이트' : '수동'}
                  </span>
                </div>
              </div>

              {/* 피드 URL */}
              {setting.feedUrl && (
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <LinkIcon className="w-4 h-4 text-white/60" />
                    <span className="text-xs text-white/60">피드 URL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-brand-neon break-all">
                      {setting.feedUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(setting.feedUrl!, setting.id)}
                      className="btn-secondary text-xs flex items-center gap-1 whitespace-nowrap"
                    >
                      {copiedId === setting.id ? (
                        <>
                          <CheckCircleIcon className="w-3 h-3" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-3 h-3" />
                          복사
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* 상세 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-white/50 mb-1">상품 수</p>
                  <p className="text-sm text-white font-semibold">
                    {setting.totalProducts.toLocaleString()}개
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">업데이트 주기</p>
                  <p className="text-sm text-white font-semibold">
                    {setting.updateFrequency}시간
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">비활성 상품 포함</p>
                  <p className="text-sm text-white font-semibold">
                    {setting.includeInactive ? '예' : '아니오'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">마지막 생성</p>
                  <p className="text-sm text-white font-semibold">
                    {setting.lastGenerated
                      ? new Date(setting.lastGenerated).toLocaleDateString('ko-KR')
                      : '-'}
                  </p>
                </div>
              </div>

              {/* 추가 정보 */}
              {(setting.storeUrl || setting.merchantId) && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {setting.storeUrl && (
                      <div>
                        <span className="text-white/50">상점 URL: </span>
                        <a
                          href={setting.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-cyan hover:underline"
                        >
                          {setting.storeUrl}
                        </a>
                      </div>
                    )}
                    {setting.merchantId && (
                      <div>
                        <span className="text-white/50">Merchant ID: </span>
                        <span className="text-white">{setting.merchantId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 안내 */}
      <div className="mt-8 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">
          💡 Google 피드 관리 안내
        </h3>
        <ul className="text-xs text-white/70 space-y-1 ml-4 list-disc">
          <li>각 사용자의 Google Shopping 피드 설정을 확인할 수 있습니다</li>
          <li>피드 URL을 복사하여 Google Merchant Center에 등록할 수 있습니다</li>
          <li>자동 업데이트가 활성화된 피드는 설정된 주기마다 자동으로 갱신됩니다</li>
          <li>피드 설정은 사용자가 Seller 사이트에서 직접 관리할 수 없습니다</li>
        </ul>
      </div>
    </div>
  );
}

