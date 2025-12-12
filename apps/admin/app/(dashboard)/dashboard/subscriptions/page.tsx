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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    endDate: '',
    autoRenew: false,
  });

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

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setEditForm({
      status: subscription.status,
      endDate: subscription.endDate ? subscription.endDate.split('T')[0] : '',
      autoRenew: subscription.autoRenew,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingSubscription) return;

    try {
      const response = await fetch(`/api/admin/subscriptions/${editingSubscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        alert('구독이 수정되었습니다.');
        setIsEditModalOpen(false);
        fetchSubscriptions();
      } else {
        const error = await response.json();
        alert(error.error || '구독 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
      alert('구독 수정 중 오류가 발생했습니다.');
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
            <option value="all" className="bg-white text-gray-900">전체 상태</option>
            <option value="ACTIVE" className="bg-white text-gray-900">활성</option>
            <option value="EXPIRED" className="bg-white text-gray-900">만료</option>
            <option value="CANCELLED" className="bg-white text-gray-900">취소</option>
            <option value="TRIAL" className="bg-white text-gray-900">체험</option>
          </select>

          {/* 플랜 필터 */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-neon/50"
          >
            <option value="all" className="bg-white text-gray-900">전체 플랜</option>
            <option value="FREE" className="bg-white text-gray-900">무료 체험 (5개)</option>
            <option value="STARTER" className="bg-white text-gray-900">Starter (10개)</option>
            <option value="PRO" className="bg-white text-gray-900">Pro (50개)</option>
            <option value="ENTERPRISE" className="bg-white text-gray-900">Enterprise (50개 초과)</option>
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
                      <button 
                        onClick={() => handleEdit(sub)}
                        className="btn-secondary text-sm flex items-center gap-2 ml-auto"
                      >
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

      {/* 수정 모달 */}
      {isEditModalOpen && editingSubscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-6">구독 정보 수정</h2>

            {/* 사용자 정보 */}
            <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 mb-1">사용자</p>
              <p className="text-white font-medium">{editingSubscription.user.name}</p>
              <p className="text-sm text-white/60">{editingSubscription.user.email}</p>
            </div>

            <div className="space-y-4 mb-6">
              {/* 상태 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  구독 상태
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-neon/50"
                >
                  <option value="ACTIVE" className="bg-white text-gray-900">활성</option>
                  <option value="EXPIRED" className="bg-white text-gray-900">만료</option>
                  <option value="CANCELLED" className="bg-white text-gray-900">취소</option>
                  <option value="TRIAL" className="bg-white text-gray-900">체험</option>
                </select>
              </div>

              {/* 종료일 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  종료일
                </label>
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-neon/50"
                />
                <p className="text-xs text-white/50 mt-1">
                  비워두면 무제한으로 설정됩니다
                </p>
              </div>

              {/* 자동갱신 */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.autoRenew}
                    onChange={(e) => setEditForm({ ...editForm, autoRenew: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-neon focus:ring-brand-neon/50"
                  />
                  <span className="text-white/80 font-medium">자동 갱신</span>
                </label>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-xl font-medium bg-white/5 text-white hover:bg-white/10 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 px-6 py-3 rounded-xl font-medium bg-brand-neon text-brand-navy hover:bg-brand-cyan transition-all"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

