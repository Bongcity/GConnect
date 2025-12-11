'use client';

import Link from 'next/link';
import {
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  MegaphoneIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function SupportPage() {
  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">고객 지원</h1>
        <p className="text-white/60">문의, FAQ, 공지사항 관리</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/dashboard/support/inquiries"
          className="glass-card p-8 hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30 w-fit mb-4">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">IR 문의</h2>
          <p className="text-white/60 text-sm">IR 사이트 문의 조회 및 답변</p>
        </Link>

        <Link
          href="/dashboard/support/seller-inquiries"
          className="glass-card p-8 hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="p-4 rounded-xl bg-purple-500/20 border border-purple-500/30 w-fit mb-4">
            <UserGroupIcon className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">셀러 문의</h2>
          <p className="text-white/60 text-sm">셀러 대시보드 문의 조회 및 답변</p>
        </Link>

        <Link
          href="/dashboard/support/faq"
          className="glass-card p-8 hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 w-fit mb-4">
            <QuestionMarkCircleIcon className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">FAQ 관리</h2>
          <p className="text-white/60 text-sm">자주 묻는 질문 관리</p>
        </Link>

        <Link
          href="/dashboard/support/announcements"
          className="glass-card p-8 hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="p-4 rounded-xl bg-orange-500/20 border border-orange-500/30 w-fit mb-4">
            <MegaphoneIcon className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">공지사항</h2>
          <p className="text-white/60 text-sm">공지사항 작성 및 관리</p>
        </Link>
      </div>
    </div>
  );
}

