'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-6xl">
      {/* 환영 메시지 */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          환영합니다, {session?.user?.name}님! 🎉
        </h1>
        <p className="text-xl text-white/70">
          GConnect로 네이버 스마트스토어를 구글에 연결하세요
        </p>
      </div>

      {/* 상태 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">계정 상태</h3>
            <ClockIcon className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400 mb-2">대기 중</p>
          <p className="text-sm text-white/60">설정을 완료해주세요</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">연결된 상품</h3>
            <CheckCircleIcon className="w-6 h-6 text-brand-neon" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">0개</p>
          <p className="text-sm text-white/60">상품을 연결하세요</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">구글 노출</h3>
            <RocketLaunchIcon className="w-6 h-6 text-brand-cyan" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">0회</p>
          <p className="text-sm text-white/60">곧 시작됩니다</p>
        </div>
      </div>

      {/* 시작 가이드 */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-white mb-6">빠른 시작 가이드</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-neon/20 flex items-center justify-center">
              <span className="text-brand-neon font-bold">1</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                네이버 스마트스토어 연결
              </h3>
              <p className="text-white/60 mb-3">
                상점 ID 또는 API 키를 입력하여 스마트스토어를 연결하세요.
              </p>
              <Link href="/dashboard/settings" className="btn-neon text-sm inline-block">
                연결하기
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 opacity-50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white/60 font-bold">2</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white/60 mb-2">
                상품 동기화 확인
              </h3>
              <p className="text-white/40">
                자동으로 상품이 수집되고 SEO 구조로 변환됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 opacity-50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white/60 font-bold">3</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white/60 mb-2">
                구글 검색 노출 시작
              </h3>
              <p className="text-white/40">
                24시간 내에 구글 검색에 노출되기 시작합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 도움말 */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-brand-neon/10 to-brand-cyan/10 border border-brand-neon/20">
        <h3 className="text-lg font-semibold text-white mb-2">
          도움이 필요하신가요?
        </h3>
        <p className="text-white/70 mb-4">
          설정 중 문제가 발생하면 언제든지 문의해주세요.
        </p>
        <button className="btn-secondary text-sm">
          문의하기
        </button>
      </div>
    </div>
  );
}

