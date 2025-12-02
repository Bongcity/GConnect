'use client';

import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Subscription {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    shopName: string;
  };
  plan: {
    id: string;
    name: string;
    displayName: string;
    maxProducts: number;
    monthlyPrice: number;
  };
  status: string;
  currentProducts: number;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링된 구독
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user.shopName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || sub.plan.name === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircleIcon className="w-3 h-3" />
            활성
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircleIcon className="w-3 h-3" />
            만료
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <XCircleIcon className="w-3 h-3" />
            취소
          </span>
        );
      case 'TRIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <ClockIcon className="w-3 h-3" />
            체험
          </span>
        );
      default:
        return null;
    }
  };

  // 통계 계산
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === 'ACTIVE').length,
    expired: subscriptions.filter((s) => s.status === 'EXPIRED').length,
    totalRevenue: subscriptions
      .filter((s) => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + s.plan.monthlyPrice, 0),
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
        <h1 className="text-4xl font-bold text-white mb-2">구독 관리</h1>
        <p className="text-white/60">사용자 구독 플랜 및 결제 상태를 관리합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">전체 구독</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">활성 구독</p>
          <p className="text-3xl font-bold text-green-400">{stats.active}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">만료 구독</p>
          <p className="text-3xl font-bold text-red-400">{stats.expired}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">월 예상 수익</p>
          <p className="text-3xl font-bold text-brand-neon">
            {(stats.totalRevenue / 10000).toFixed(0)}만원
          </p>
        </div>
      </div>

      {/* 필터 & 검색 */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="사용자 이름, 이메일, 상점명 검색..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50"
            />
          </div>

          {/* 상태 필터 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-neon/50"
          >
            <option value="all">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="EXPIRED">만료</option>
            <option value="CANCELLED">취소</option>
            <option value="TRIAL">체험</option>
          </select>

          {/* 플랜 필터 */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-neon/50"
          >
            <option value="all">전체 플랜</option>
            <option value="FREE">무료 체험</option>
            <option value="STARTER">Starter (10K)</option>
            <option value="PRO">Pro (50K)</option>
            <option value="ENTERPRISE">Enterprise (50K+)</option>
          </select>
        </div>
      </div>

      {/* 구독 목록 */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">사용자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">플랜</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">동기화 상품</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">기간</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">자동갱신</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/60">
                    구독 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{sub.user.name}</p>
                        <p className="text-sm text-white/60">{sub.user.email}</p>
                        {sub.user.shopName && (
                          <p className="text-xs text-white/50">{sub.user.shopName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{sub.plan.displayName}</p>
                        <p className="text-sm text-white/60">
                          {sub.plan.monthlyPrice.toLocaleString()}원/월
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-neon"
                              style={{
                                width: `${Math.min(100, (sub.currentProducts / sub.plan.maxProducts) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-white/70 whitespace-nowrap">
                          {sub.currentProducts} / {sub.plan.maxProducts}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white/70">
                          {new Date(sub.startDate).toLocaleDateString('ko-KR')}
                        </p>
                        {sub.endDate && (
                          <p className="text-white/50">
                            ~ {new Date(sub.endDate).toLocaleDateString('ko-KR')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm ${
                          sub.autoRenew ? 'text-green-400' : 'text-white/50'
                        }`}
                      >
                        {sub.autoRenew ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="btn-secondary text-sm flex items-center gap-2 ml-auto">
                        <PencilIcon className="w-4 h-4" />
                        수정
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

