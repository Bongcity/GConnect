'use client';

import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface Webhook {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    shopName: string;
  };
  name: string;
  url: string;
  type: string;
  isEnabled: boolean;
  triggerOnSuccess: boolean;
  triggerOnError: boolean;
  lastTriggered: string | null;
  lastStatus: string | null;
  totalTriggers: number;
  successTriggers: number;
  failedTriggers: number;
}

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    url: '',
    type: 'CUSTOM',
    isEnabled: true,
    triggerOnSuccess: true,
    triggerOnError: true,
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/admin/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingWebhook(null);
    setFormData({
      userId: '',
      name: '',
      url: '',
      type: 'CUSTOM',
      isEnabled: true,
      triggerOnSuccess: true,
      triggerOnError: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setFormData({
      userId: webhook.user.id,
      name: webhook.name,
      url: webhook.url,
      type: webhook.type,
      isEnabled: webhook.isEnabled,
      triggerOnSuccess: webhook.triggerOnSuccess,
      triggerOnError: webhook.triggerOnError,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingWebhook
        ? `/api/admin/webhooks/${editingWebhook.id}`
        : '/api/admin/webhooks';
      
      const method = editingWebhook ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingWebhook ? '웹훅이 수정되었습니다.' : '웹훅이 생성되었습니다.');
        setIsModalOpen(false);
        fetchWebhooks();
      } else {
        const data = await response.json();
        alert(data.error || '작업에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save webhook:', error);
      alert('작업에 실패했습니다.');
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm('정말 이 웹훅을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/webhooks/${webhookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('웹훅이 삭제되었습니다.');
        fetchWebhooks();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const toggleWebhook = async (webhookId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !currentStatus }),
      });

      if (response.ok) {
        fetchWebhooks();
      }
    } catch (error) {
      console.error('Failed to toggle webhook:', error);
    }
  };

  // 필터링된 웹훅
  const filteredWebhooks = webhooks.filter((webhook) => {
    const matchesSearch =
      webhook.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webhook.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webhook.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 상태 배지
  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircleIcon className="w-3 h-3" />
            성공
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircleIcon className="w-3 h-3" />
            실패
          </span>
        );
      default:
        return null;
    }
  };

  // 통계
  const stats = {
    total: webhooks.length,
    enabled: webhooks.filter((w) => w.isEnabled).length,
    totalTriggers: webhooks.reduce((sum, w) => sum + w.totalTriggers, 0),
    successRate:
      webhooks.reduce((sum, w) => sum + w.totalTriggers, 0) > 0
        ? (webhooks.reduce((sum, w) => sum + w.successTriggers, 0) /
            webhooks.reduce((sum, w) => sum + w.totalTriggers, 0)) *
          100
        : 0,
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">웹훅 관리</h1>
          <p className="text-white/60">
            Enterprise 플랜 사용자의 웹훅을 관리합니다
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          웹훅 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">전체 웹훅</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">활성화</p>
          <p className="text-3xl font-bold text-green-400">{stats.enabled}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">총 실행 횟수</p>
          <p className="text-3xl font-bold text-brand-cyan">{stats.totalTriggers}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">성공률</p>
          <p className="text-3xl font-bold text-brand-neon">{stats.successRate.toFixed(1)}%</p>
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
            placeholder="사용자 이름, 이메일, 웹훅 이름 검색..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50"
          />
        </div>
      </div>

      {/* 웹훅 목록 */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">사용자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">웹훅 정보</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">트리거</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">마지막 실행</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">통계</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredWebhooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/60">
                    웹훅이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredWebhooks.map((webhook) => (
                  <tr
                    key={webhook.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{webhook.user.name}</p>
                        <p className="text-sm text-white/60">{webhook.user.email}</p>
                        {webhook.user.shopName && (
                          <p className="text-xs text-white/50">{webhook.user.shopName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{webhook.name}</p>
                        <p className="text-sm text-white/60 truncate max-w-xs">{webhook.url}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-white/5 text-white/70">
                          {webhook.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {webhook.isEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                          <PlayIcon className="w-3 h-3" />
                          활성
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {webhook.triggerOnSuccess && (
                          <span className="text-green-400">• 성공 시</span>
                        )}
                        {webhook.triggerOnError && (
                          <span className="text-red-400">• 실패 시</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {webhook.lastTriggered ? (
                          <>
                            <p className="text-white/70">
                              {new Date(webhook.lastTriggered).toLocaleString('ko-KR')}
                            </p>
                            {getStatusBadge(webhook.lastStatus)}
                          </>
                        ) : (
                          <span className="text-white/50">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">총 {webhook.totalTriggers}회</p>
                        <p className="text-green-400 text-xs">성공 {webhook.successTriggers}</p>
                        <p className="text-red-400 text-xs">실패 {webhook.failedTriggers}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleWebhook(webhook.id, webhook.isEnabled)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            webhook.isEnabled
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                          }`}
                        >
                          {webhook.isEnabled ? '활성' : '비활성'}
                        </button>
                        <button
                          onClick={() => openEditModal(webhook)}
                          className="btn-secondary text-sm flex items-center gap-1"
                        >
                          <PencilIcon className="w-4 h-4" />
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(webhook.id)}
                          className="btn-secondary text-sm text-red-400 hover:bg-red-500/20"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 안내 */}
      <div className="mt-8 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">
          💡 웹훅 관리 안내
        </h3>
        <ul className="text-xs text-white/70 space-y-1 ml-4 list-disc">
          <li>웹훅은 Enterprise 플랜 사용자만 사용할 수 있습니다</li>
          <li>사용자 요청 시 관리자가 직접 웹훅을 생성/수정합니다</li>
          <li>동기화 성공/실패 시 설정된 URL로 POST 요청이 전송됩니다</li>
          <li>Slack, Discord, 커스텀 웹훅을 지원합니다</li>
          <li>사용자는 Seller 사이트에서 실행 결과만 확인할 수 있습니다</li>
        </ul>
      </div>

      {/* 웹훅 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingWebhook ? '웹훅 수정' : '웹훅 추가'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 사용자 ID */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  사용자 ID *
                </label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="사용자 ID를 입력하세요"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50"
                  required
                  disabled={!!editingWebhook}
                />
                <p className="text-xs text-white/50 mt-1">
                  사용자 관리 페이지에서 사용자 ID를 확인할 수 있습니다
                </p>
              </div>

              {/* 웹훅 이름 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  웹훅 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 동기화 알림"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50"
                  required
                />
              </div>

              {/* 웹훅 URL */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  웹훅 URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50"
                  required
                />
              </div>

              {/* 웹훅 타입 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  웹훅 타입 *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f2e] border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-neon/50 cursor-pointer"
                >
                  <option value="SLACK" className="bg-[#1a1f2e]">Slack</option>
                  <option value="DISCORD" className="bg-[#1a1f2e]">Discord</option>
                  <option value="CUSTOM" className="bg-[#1a1f2e]">커스텀</option>
                </select>
              </div>

              {/* 트리거 설정 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/80">
                  트리거 조건
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.triggerOnSuccess}
                    onChange={(e) => setFormData({ ...formData, triggerOnSuccess: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-neon focus:ring-brand-neon/50"
                  />
                  <span className="text-white/80">동기화 성공 시 알림</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.triggerOnError}
                    onChange={(e) => setFormData({ ...formData, triggerOnError: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-neon focus:ring-brand-neon/50"
                  />
                  <span className="text-white/80">동기화 실패 시 알림</span>
                </label>
              </div>

              {/* 활성화 상태 */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-neon focus:ring-brand-neon/50"
                  />
                  <span className="text-white/80 font-medium">웹훅 활성화</span>
                </label>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingWebhook ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

