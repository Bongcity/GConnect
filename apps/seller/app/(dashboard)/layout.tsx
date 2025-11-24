'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
  ClockIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex">
      {/* 사이드바 */}
      <aside className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 p-6">
        {/* 로고 */}
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 group">
          <div className="relative w-32 h-8">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan"
              style={{
                WebkitMaskImage: 'url(/GConnect-logo.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/GConnect-logo.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            />
          </div>
          <span className="px-2 py-0.5 rounded-md text-xs font-bold text-brand-neon/80 bg-brand-neon/10 border border-brand-neon/20">
            SELLER
          </span>
        </Link>

        {/* 사용자 정보 */}
        <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-white/60 mb-1">환영합니다!</p>
          <p className="text-white font-semibold">{session?.user?.name}</p>
          <p className="text-xs text-white/50 truncate">{session?.user?.email}</p>
        </div>

        {/* 메뉴 */}
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <HomeIcon className="w-5 h-5" />
            <span>대시보드</span>
          </Link>
          <Link
            href="/dashboard/products"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>상품 관리</span>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>성과 분석</span>
          </Link>
          <Link
            href="/dashboard/sync-logs"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <ClockIcon className="w-5 h-5" />
            <span>동기화 로그</span>
          </Link>
          <Link
            href="/dashboard/webhooks"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <BoltIcon className="w-5 h-5" />
            <span>웹훅</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
          >
            <CogIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>설정</span>
          </Link>
        </nav>

        {/* 로그아웃 */}
        <button
          onClick={handleSignOut}
          className="mt-8 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-red-400 hover:bg-white/5 transition-all"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>로그아웃</span>
        </button>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

