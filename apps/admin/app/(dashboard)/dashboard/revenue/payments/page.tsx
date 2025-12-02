'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  transactionId: string | null;
  createdAt: string;
  subscription: {
    user: {
      email: string;
      name: string | null;
      shopName: string | null;
    };
    plan: {
      displayName: string;
    };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, methodFilter]);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        method: methodFilter,
        search,
      });

      const res = await fetch(`/api/admin/revenue/payments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPayments();
  };

  const handleRefund = async () => {
    if (!selectedPayment || !refundReason.trim()) {
      alert('환불 사유를 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/revenue/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REFUNDED',
          refundReason,
        }),
      });

      if (res.ok) {
        alert('환불 처리되었습니다.');
        setShowRefundModal(false);
        setRefundReason('');
        fetchPayments();
      }
    } catch (error) {
      console.error('Refund failed:', error);
      alert('환불 처리에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      SUCCESS: 'bg-green-500/20 text-green-400 border-green-500/30',
      FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
      REFUNDED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };

    const labels = {
      SUCCESS: '성공',
      FAILED: '실패',
      REFUNDED: '환불',
      PENDING: '대기',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles] || styles.PENDING
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
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
          <h1 className="text-4xl font-bold text-white mb-2">결제 내역</h1>
          <p className="text-white/60">전체 결제 내역 조회 및 관리</p>
        </div>
        <Link
          href="/dashboard/revenue"
          className="btn-secondary"
        >
          ← 매출 대시보드
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="glass-card p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="사용자명, 이메일, 거래 ID 검색..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-red-400/50"
              />
            </div>
            <button
              onClick={handleSearch}
              className="btn-primary"
            >
              검색
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#1a1f2e] border border-white/20 text-white focus:outline-none focus:border-red-400/50"
          >
            <option value="ALL">전체 상태</option>
            <option value="SUCCESS">성공</option>
            <option value="FAILED">실패</option>
            <option value="REFUNDED">환불</option>
            <option value="PENDING">대기</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#1a1f2e] border border-white/20 text-white focus:outline-none focus:border-red-400/50"
          >
            <option value="ALL">전체 결제수단</option>
            <option value="CARD">카드</option>
            <option value="BANK">계좌이체</option>
            <option value="MANUAL">수동</option>
          </select>
        </div>
      </div>

      {/* 결제 목록 */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  사용자
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  플랜
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  금액
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  결제수단
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  결제일
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-white/60"
                  >
                    결제 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {payment.subscription.user.name ||
                            payment.subscription.user.email}
                        </p>
                        <p className="text-sm text-white/60">
                          {payment.subscription.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {payment.subscription.plan.displayName}
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      {payment.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 text-white/80">{payment.method}</td>
                    <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {format(new Date(payment.createdAt), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === 'SUCCESS' && (
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowRefundModal(true);
                          }}
                          className="btn-secondary text-sm text-red-400 hover:bg-red-500/20"
                        >
                          환불
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 환불 모달 */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-6">환불 처리</h2>

            <div className="mb-6">
              <p className="text-white/60 text-sm mb-2">사용자</p>
              <p className="text-white">
                {selectedPayment.subscription.user.email}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-white/60 text-sm mb-2">금액</p>
              <p className="text-white font-semibold text-xl">
                {selectedPayment.amount.toLocaleString()}원
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-2">
                환불 사유 *
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="환불 사유를 입력하세요"
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-red-400/50"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundReason('');
                }}
                className="flex-1 btn-secondary"
              >
                취소
              </button>
              <button
                onClick={handleRefund}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                환불 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

