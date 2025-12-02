'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  ArrowUpIcon,
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

interface SubscriptionData {
  plan: {
    name: string;
    displayName: string;
  };
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchWebhooks();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
        // Enterprise 플랜만 접근 가능
        setHasAccess(data.plan.name === 'ENTERPRISE');
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  // Enterprise 플랜이 아닌 경우 접근 제한
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/20 flex items-center justify-center">
              <LockClosedIcon className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Enterprise 플랜 전용 기능
          </h1>
          <p className="text-xl text-white/70 mb-8">
            웹훅은 Enterprise 플랜에서만 사용할 수 있습니다
          </p>
          
          <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">웹훅 기능이란?</h3>
            <ul className="space-y-2 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-brand-neon mt-1">•</span>
                <span>동기화 완료 시 외부 시스템(Slack, Discord 등)에 자동 알림</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-neon mt-1">•</span>
                <span>자체 재고 관리 시스템과 실시간 연동</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-neon mt-1">•</span>
                <span>복잡한 자동화 워크플로우 구축</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-neon mt-1">•</span>
                <span>개발자가 커스텀 통합 구현 가능</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/settings" className="btn-neon inline-flex items-center justify-center gap-2">
              <ArrowUpIcon className="w-5 h-5" />
              Enterprise 플랜으로 업그레이드
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              대시보드로 돌아가기
            </Link>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-400">
              💡 웹훅 설정이 필요하신가요? Enterprise 플랜 구독 후 관리자에게 문의하시면 설정을 도와드립니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">웹훅 실행 내역</h1>
            <p className="text-white/60">관리자가 설정한 웹훅의 실행 결과를 확인합니다</p>
          </div>
          <span className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold">
            Enterprise 플랜
          </span>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-400">
            💡 웹훅 추가/수정/삭제는 관리자에게 문의하세요. 여기서는 실행 결과만 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 웹훅 목록 (읽기 전용) */}
      {webhooks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            설정된 웹훅이 없습니다
          </h3>
          <p className="text-white/60 mb-6">
            웹훅 설정이 필요하시면 관리자에게 문의하세요
          </p>
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

              {/* 통계 (읽기 전용) */}
              <div className="grid grid-cols-3 gap-3">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

