'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface Webhook {
  id: string;
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

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState({
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
      const response = await fetch('/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks);
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingWebhook
        ? `/api/webhooks/${editingWebhook.id}`
        : '/api/webhooks';
      
      const response = await fetch(url, {
        method: editingWebhook ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingWebhook(null);
        setFormData({
          name: '',
          url: '',
          type: 'CUSTOM',
          isEnabled: true,
          triggerOnSuccess: true,
          triggerOnError: true,
        });
        fetchWebhooks();
      }
    } catch (error) {
      console.error('Failed to save webhook:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchWebhooks();
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const handleTest = async (id: string) => {
    try {
      const response = await fetch(`/api/webhooks/${id}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('테스트 웹훅이 전송되었습니다!');
        fetchWebhooks();
      }
    } catch (error) {
      console.error('Failed to test webhook:', error);
      alert('테스트 실패');
    }
  };

  const openAddModal = () => {
    setEditingWebhook(null);
    setFormData({
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
      name: webhook.name,
      url: webhook.url,
      type: webhook.type,
      isEnabled: webhook.isEnabled,
      triggerOnSuccess: webhook.triggerOnSuccess,
      triggerOnError: webhook.triggerOnError,
    });
    setIsModalOpen(true);
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
          <h1 className="text-4xl font-bold text-white mb-2">웹훅</h1>
          <p className="text-white/60">동기화 완료 시 외부 시스템에 알림을 보냅니다</p>
        </div>
        <button onClick={openAddModal} className="btn-neon flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          웹훅 추가
        </button>
      </div>

      {/* 웹훅 목록 */}
      {webhooks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            아직 웹훅이 없습니다
          </h3>
          <p className="text-white/60 mb-6">
            Slack, Discord 또는 커스텀 웹훅을 추가하세요
          </p>
          <button onClick={openAddModal} className="btn-neon">
            첫 웹훅 추가
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{webhook.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        webhook.type === 'SLACK'
                          ? 'bg-purple-500/20 text-purple-400'
                          : webhook.type === 'DISCORD'
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {webhook.type}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 break-all">{webhook.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  {webhook.lastStatus === 'SUCCESS' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : webhook.lastStatus === 'FAILED' ? (
                    <XCircleIcon className="w-5 h-5 text-red-400" />
                  ) : null}
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-xs text-white/50 mb-1">총 실행</p>
                  <p className="text-lg font-bold text-white">{webhook.totalTriggers}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/50 mb-1">성공</p>
                  <p className="text-lg font-bold text-green-400">{webhook.successTriggers}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/50 mb-1">실패</p>
                  <p className="text-lg font-bold text-red-400">{webhook.failedTriggers}</p>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleTest(webhook.id)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  테스트
                </button>
                <button
                  onClick={() => openEditModal(webhook)}
                  className="btn-secondary flex-1"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(webhook.id)}
                  className="btn-secondary text-red-400 hover:bg-red-500/20"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="glass-card p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingWebhook ? '웹훅 수정' : '웹훅 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  타입
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                >
                  <option value="CUSTOM">커스텀</option>
                  <option value="SLACK">Slack</option>
                  <option value="DISCORD">Discord</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  placeholder="https://hooks.slack.com/..."
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="triggerOnSuccess"
                    checked={formData.triggerOnSuccess}
                    onChange={(e) =>
                      setFormData({ ...formData, triggerOnSuccess: e.target.checked })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="triggerOnSuccess" className="text-white">
                    성공 시 트리거
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="triggerOnError"
                    checked={formData.triggerOnError}
                    onChange={(e) =>
                      setFormData({ ...formData, triggerOnError: e.target.checked })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="triggerOnError" className="text-white">
                    실패 시 트리거
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-neon flex-1">
                  {editingWebhook ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

