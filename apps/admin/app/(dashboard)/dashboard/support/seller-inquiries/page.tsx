'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Inquiry {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  status: string;
  userEmail: string;
  userName: string;
  userShopName: string | null;
  adminReply: string | null;
  adminName: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SellerInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, categoryFilter]);

  const fetchInquiries = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        category: categoryFilter,
        search,
      });

      const res = await fetch(`/api/admin/support/seller-inquiries?${params}`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries);
      } else {
        console.error('Failed to fetch inquiries');
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

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/support/seller-inquiries/${selectedInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminReply: response,
          status: 'RESOLVED',
        }),
      });

      if (res.ok) {
        alert('답변이 등록되었습니다.');
        setSelectedInquiry(null);
        setResponse('');
        fetchInquiries();
      } else {
        alert('답변 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Response failed:', error);
      alert('답변 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      PENDING: { label: '대기중', color: 'yellow' },
      IN_PROGRESS: { label: '처리중', color: 'blue' },
      RESOLVED: { label: '해결됨', color: 'green' },
      CLOSED: { label: '종료', color: 'gray' },
    };

    const { label, color } = statusMap[status] || { label: status, color: 'gray' };

    const colorClasses: any = {
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses[color]}`}>
        {label}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: any = {
      GENERAL: { label: '일반', color: 'bg-gray-500/20 text-gray-400' },
      TECHNICAL: { label: '기술', color: 'bg-blue-500/20 text-blue-400' },
      BILLING: { label: '결제', color: 'bg-green-500/20 text-green-400' },
      FEATURE: { label: '기능', color: 'bg-purple-500/20 text-purple-400' },
      BUG: { label: '버그', color: 'bg-red-500/20 text-red-400' },
    };

    const { label, color } = categoryMap[category] || { label: category, color: 'bg-gray-500/20 text-gray-400' };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
        {label}
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
        <h1 className="text-4xl font-bold text-white mb-2">셀러 문의 관리</h1>
        <p className="text-white/60">셀러 대시보드에서 접수된 문의 조회 및 답변</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-white/60 text-sm mb-1">전체 문의</p>
          <p className="text-2xl font-bold text-white">{inquiries.length}건</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-white/60 text-sm mb-1">대기중</p>
          <p className="text-2xl font-bold text-yellow-400">
            {inquiries.filter(i => i.status === 'PENDING').length}건
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-white/60 text-sm mb-1">처리중</p>
          <p className="text-2xl font-bold text-blue-400">
            {inquiries.filter(i => i.status === 'IN_PROGRESS').length}건
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-white/60 text-sm mb-1">해결됨</p>
          <p className="text-2xl font-bold text-green-400">
            {inquiries.filter(i => i.status === 'RESOLVED').length}건
          </p>
        </div>
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
                placeholder="제목, 내용, 사용자명, 이메일 검색..."
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
            <option value="ALL" className="bg-gray-800">전체 상태</option>
            <option value="PENDING" className="bg-gray-800">대기중</option>
            <option value="IN_PROGRESS" className="bg-gray-800">처리중</option>
            <option value="RESOLVED" className="bg-gray-800">해결됨</option>
            <option value="CLOSED" className="bg-gray-800">종료</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#1a1f2e] border border-white/20 text-white focus:outline-none"
          >
            <option value="ALL" className="bg-gray-800">전체 유형</option>
            <option value="GENERAL" className="bg-gray-800">일반 문의</option>
            <option value="TECHNICAL" className="bg-gray-800">기술 지원</option>
            <option value="BILLING" className="bg-gray-800">결제/구독</option>
            <option value="FEATURE" className="bg-gray-800">기능 요청</option>
            <option value="BUG" className="bg-gray-800">버그 신고</option>
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
                  제목
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  사용자
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
                  <td colSpan={6} className="px-6 py-12 text-center text-white/60">
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
                      <p className="text-white font-medium">{inquiry.title}</p>
                      <p className="text-sm text-white/60 line-clamp-1">{inquiry.content}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{inquiry.userName}</p>
                        <p className="text-sm text-white/60">{inquiry.userEmail}</p>
                        {inquiry.userShopName && (
                          <p className="text-xs text-white/40">{inquiry.userShopName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getCategoryBadge(inquiry.category)}</td>
                    <td className="px-6 py-4">{getStatusBadge(inquiry.status)}</td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {format(new Date(inquiry.createdAt), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setResponse(inquiry.adminReply || '');
                        }}
                        className="btn-secondary text-sm"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-1" />
                        {inquiry.status === 'RESOLVED' ? '보기' : '답변'}
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
          <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0f1419] z-10">
              <h2 className="text-2xl font-bold text-white">문의 상세</h2>
              <button
                onClick={() => {
                  setSelectedInquiry(null);
                  setResponse('');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6 space-y-6">
              {/* 사용자 정보 */}
              <div className="p-4 rounded-xl bg-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm mb-1">사용자명</p>
                    <p className="text-white font-medium">{selectedInquiry.userName}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">이메일</p>
                    <p className="text-white font-medium">{selectedInquiry.userEmail}</p>
                  </div>
                  {selectedInquiry.userShopName && (
                    <div className="col-span-2">
                      <p className="text-white/60 text-sm mb-1">상점명</p>
                      <p className="text-white font-medium">{selectedInquiry.userShopName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 문의 정보 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryBadge(selectedInquiry.category)}
                  {getStatusBadge(selectedInquiry.status)}
                  <span className="text-white/60 text-sm ml-auto">
                    {format(new Date(selectedInquiry.createdAt), 'yyyy-MM-dd HH:mm')}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-white/60 text-sm mb-1">제목</p>
                  <p className="text-white text-lg font-semibold">{selectedInquiry.title}</p>
                </div>

                <div>
                  <p className="text-white/60 text-sm mb-2">문의 내용</p>
                  <div className="p-4 bg-white/5 rounded-xl text-white whitespace-pre-wrap">
                    {selectedInquiry.content}
                  </div>
                </div>
              </div>

              {/* 기존 답변 (있다면) */}
              {selectedInquiry.adminReply && (
                <div>
                  <p className="text-white/60 text-sm mb-2">관리자 답변</p>
                  <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                    <p className="text-sm text-green-400 mb-2">
                      {selectedInquiry.adminName} • {selectedInquiry.repliedAt && format(new Date(selectedInquiry.repliedAt), 'yyyy-MM-dd HH:mm')}
                    </p>
                    <p className="text-white whitespace-pre-wrap">{selectedInquiry.adminReply}</p>
                  </div>
                </div>
              )}

              {/* 답변 작성 */}
              {selectedInquiry.status !== 'RESOLVED' && selectedInquiry.status !== 'CLOSED' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    답변 작성 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="답변 내용을 입력하세요"
                    rows={8}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-red-400/50 resize-none"
                  />
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedInquiry(null);
                    setResponse('');
                  }}
                  className="flex-1 btn-secondary"
                  disabled={isSubmitting}
                >
                  닫기
                </button>
                {selectedInquiry.status !== 'RESOLVED' && selectedInquiry.status !== 'CLOSED' && (
                  <button 
                    onClick={handleResponse} 
                    className="flex-1 btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '등록 중...' : '답변 등록'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

