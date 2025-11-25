'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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
    await signOut({ callbackUrl: '/login' });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex">
      {/* 사이드바 */}
      <aside className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 p-6">
        {/* 로고 */}
        <Link href="/dashboard" className="flex items-center gap-2 mb-8">
          <ShieldCheckIcon className="w-8 h-8 text-red-400" />
          <div>
            <div className="relative w-28 h-7">
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
            <span className="block text-xs text-red-400 font-bold">ADMIN</span>
          </div>
        </Link>

        {/* 관리자 정보 */}
        <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-white/60 mb-1">관리자</p>
          <p className="text-white font-semibold">{session?.user?.name}</p>
          <p className="text-xs text-white/50 truncate">
            {session?.user?.email}
          </p>
        </div>

        {/* 메뉴 */}
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span>대시보드</span>
          </Link>

          <Link
            href="/dashboard/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/users')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <UsersIcon className="w-5 h-5" />
            <span>사용자 관리</span>
          </Link>

          <Link
            href="/dashboard/products"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/products')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>상품 관리</span>
          </Link>

          <Link
            href="/dashboard/logs"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/logs')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <DocumentTextIcon className="w-5 h-5" />
            <span>시스템 로그</span>
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
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

