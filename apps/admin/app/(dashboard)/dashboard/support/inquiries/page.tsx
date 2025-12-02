'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface Inquiry {
  id: number;
  storeName: string;
  email: string;
  phone: string | null;
  planIntent: string | null;
  inquiryType: string;
  message: string;
  isHandled: boolean;
  createdAt: string;
  responses: any[];
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, planFilter, typeFilter]);

  const fetchInquiries = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        planIntent: planFilter,
        inquiryType: typeFilter,
        search,
      });

      const res = await fetch(`/api/admin/support/inquiries?${params}`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchInquiries();
  };

  const handleResponse = async () => {
    if (!selectedInquiry || !response.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/support/inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response,
          isHandled: true,
        }),
      });

      if (res.ok) {
        alert('답변이 등록되었습니다.');
        setSelectedInquiry(null);
        setResponse('');
        fetchInquiries();
      }
    } catch (error) {
      console.error('Response failed:', error);
      alert('답변 등록에 실패했습니다.');
    }
  };

  const getStatusBadge = (isHandled: boolean) => {
    return isHandled ? (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
        <CheckCircleIcon className="w-4 h-4" />
        처리완료
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        <XCircleIcon className="w-4 h-4" />
        미처리
      </span>
    );
  };

  const getPlanBadge = (planIntent: string | null) => {
    if (!planIntent || planIntent === 'UNKNOWN') return null;
    
    const colors: any = {
      STARTER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      PRO: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      ENTERPRISE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold border ${colors[planIntent] || ''}`}>
        {planIntent}
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">문의 관리</h1>
        <p className="text-white/60">IR 사이트 문의 조회 및 답변</p>
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
                placeholder="상점명, 이메일, 내용 검색..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-red-400/50"
              />
            </div>
            <button onClick={handleSearch} className="btn-primary">
              검색
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#1a1f2e] border border-white/20 text-white focus:outline-none"
          >
            <option value="ALL">전체 상태</option>
            <option value="UNHANDLED">미처리</option>
            <option value="HANDLED">처리완료</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#1a1f2e] border border-white/20 text-white focus:outline-none"
          >
            <option value="ALL">전체 플랜</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#1a1f2e] border border-white/20 text-white focus:outline-none"
          >
            <option value="ALL">전체 유형</option>
            <option value="ADOPTION">도입문의</option>
            <option value="PRICING">요금문의</option>
            <option value="TECH">기술지원</option>
            <option value="OTHER">기타</option>
          </select>
        </div>
      </div>

      {/* 문의 목록 */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  상점명
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  연락처
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  플랜 의도
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  유형
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  문의일
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/60">
                    문의가 없습니다.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{inquiry.storeName}</p>
                        <p className="text-sm text-white/60">{inquiry.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {inquiry.phone || '-'}
                    </td>
                    <td className="px-6 py-4">{getPlanBadge(inquiry.planIntent)}</td>
                    <td className="px-6 py-4 text-white/80">{inquiry.inquiryType}</td>
                    <td className="px-6 py-4">{getStatusBadge(inquiry.isHandled)}</td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {format(new Date(inquiry.createdAt), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="btn-secondary text-sm"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-1" />
                        {inquiry.isHandled ? '보기' : '답변'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 문의 상세 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">문의 상세</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-white/60 text-sm mb-1">상점명</p>
                <p className="text-white">{selectedInquiry.storeName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">이메일</p>
                  <p className="text-white">{selectedInquiry.email}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">전화번호</p>
                  <p className="text-white">{selectedInquiry.phone || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-white/60 text-sm mb-1">문의 내용</p>
                <div className="p-4 bg-white/5 rounded-xl text-white whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                <div>
                  <p className="text-white/60 text-sm mb-2">답변 내역</p>
                  {selectedInquiry.responses.map((resp: any) => (
                    <div key={resp.id} className="p-4 bg-green-500/10 rounded-xl mb-2">
                      <p className="text-sm text-green-400 mb-1">
                        {resp.adminName} • {format(new Date(resp.createdAt), 'yyyy-MM-dd HH:mm')}
                      </p>
                      <p className="text-white whitespace-pre-wrap">{resp.response}</p>
                    </div>
                  ))}
                </div>
              )}

              {!selectedInquiry.isHandled && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    답변 작성 *
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="답변 내용을 입력하세요"
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-red-400/50"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedInquiry(null);
                  setResponse('');
                }}
                className="flex-1 btn-secondary"
              >
                닫기
              </button>
              {!selectedInquiry.isHandled && (
                <button onClick={handleResponse} className="flex-1 btn-primary">
                  답변 등록
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

