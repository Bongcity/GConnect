'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { InquiryModal } from '@/components/inquiry/InquiryModal';

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

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isNewInquiryModalOpen, setIsNewInquiryModalOpen] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/inquiry/list');
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

  const handleNewInquirySubmit = () => {
    setIsNewInquiryModalOpen(false);
    fetchInquiries(); // 새 문의 등록 후 목록 새로고침
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      PENDING: { label: '대기중', color: 'yellow', icon: ClockIcon },
      IN_PROGRESS: { label: '처리중', color: 'blue', icon: ClockIcon },
      RESOLVED: { label: '답변완료', color: 'green', icon: CheckCircleIcon },
      CLOSED: { label: '종료', color: 'gray', icon: CheckCircleIcon },
    };

    const { label, color, icon: Icon } = statusMap[status] || { 
      label: status, 
      color: 'gray',
      icon: ClockIcon 
    };

    const colorClasses: any = {
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
        {label}
      </span>
    );
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: any = {
      GENERAL: '일반 문의',
      TECHNICAL: '기술 지원',
      BILLING: '결제 문의',
      FEATURE: '기능 요청',
      BUG: '버그 신고',
    };
    return categoryMap[category] || category;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white/60">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">문의 내역</h1>
          <p className="text-white/60">접수하신 문의 내역을 확인하고 답변을 받아보세요</p>
        </div>
        <button
          onClick={() => setIsNewInquiryModalOpen(true)}
          className="btn-neon flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          새 문의 작성
        </button>
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
          <p className="text-white/60 text-sm mb-1">답변완료</p>
          <p className="text-2xl font-bold text-green-400">
            {inquiries.filter(i => i.status === 'RESOLVED').length}건
          </p>
        </div>
      </div>

      {/* 문의 목록 */}
      {inquiries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ChatBubbleLeftRightIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-4">아직 문의 내역이 없습니다.</p>
          <button
            onClick={() => setIsNewInquiryModalOpen(true)}
            className="btn-neon"
          >
            첫 문의 작성하기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="glass-card p-6 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setSelectedInquiry(inquiry)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {inquiry.title}
                    </h3>
                    {getStatusBadge(inquiry.status)}
                  </div>
                  <p className="text-sm text-white/60 mb-2">
                    {getCategoryLabel(inquiry.category)} • {format(new Date(inquiry.createdAt), 'yyyy-MM-dd HH:mm')}
                  </p>
                  <p className="text-white/70 line-clamp-2">
                    {inquiry.content}
                  </p>
                </div>
              </div>

              {inquiry.adminReply && (
                <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-green-400 mb-2">
                    ✅ 답변이 등록되었습니다 • {inquiry.repliedAt && format(new Date(inquiry.repliedAt), 'yyyy-MM-dd HH:mm')}
                  </p>
                  <p className="text-white/80 line-clamp-2">
                    {inquiry.adminReply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 문의 상세 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
              <h2 className="text-2xl font-bold text-white">문의 상세</h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6 space-y-6">
              {/* 상태 및 카테고리 */}
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedInquiry.status)}
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
                  {getCategoryLabel(selectedInquiry.category)}
                </span>
                <span className="text-white/60 text-sm ml-auto">
                  {format(new Date(selectedInquiry.createdAt), 'yyyy-MM-dd HH:mm')}
                </span>
              </div>

              {/* 제목 */}
              <div>
                <p className="text-white/60 text-sm mb-2">제목</p>
                <p className="text-white text-xl font-semibold">
                  {selectedInquiry.title}
                </p>
              </div>

              {/* 문의 내용 */}
              <div>
                <p className="text-white/60 text-sm mb-2">문의 내용</p>
                <div className="p-4 bg-white/5 rounded-xl text-white whitespace-pre-wrap">
                  {selectedInquiry.content}
                </div>
              </div>

              {/* 관리자 답변 */}
              {selectedInquiry.adminReply ? (
                <div>
                  <p className="text-white/60 text-sm mb-2">관리자 답변</p>
                  <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                    <p className="text-sm text-green-400 mb-3">
                      {selectedInquiry.adminName || '관리자'} • {selectedInquiry.repliedAt && format(new Date(selectedInquiry.repliedAt), 'yyyy-MM-dd HH:mm')}
                    </p>
                    <p className="text-white whitespace-pre-wrap">
                      {selectedInquiry.adminReply}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <p className="text-yellow-400 text-sm">
                    ⏳ 관리자가 확인 중입니다. 24시간 내에 답변 드리겠습니다.
                  </p>
                </div>
              )}

              {/* 닫기 버튼 */}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="btn-secondary px-6 py-2"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 새 문의 작성 모달 */}
      <InquiryModal 
        isOpen={isNewInquiryModalOpen} 
        onClose={() => {
          setIsNewInquiryModalOpen(false);
          handleNewInquirySubmit();
        }}
      />
    </div>
  );
}

