'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
  ClockIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface SubscriptionData {
  subscription: {
    status: string;
    endDate: string | null;
  } | null;
  plan: {
    name: string;
    displayName: string;
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

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
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-white/60 mb-1">환영합니다!</p>
          <p className="text-white font-semibold">{session?.user?.name}</p>
          <p className="text-xs text-white/50 truncate">{session?.user?.email}</p>
        </div>

        {/* 구독 플랜 정보 */}
        {subscriptionData && (
          <div className="mb-8">
            {/* 플랜 정보 */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-brand-neon/10 to-brand-cyan/10 border border-brand-neon/20 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-brand-neon" />
                <p className="text-xs text-white/70">현재 플랜</p>
              </div>
              <p className="text-lg font-bold text-white mb-1">
                {subscriptionData.plan.displayName}
              </p>
              {subscriptionData.subscription?.endDate && (
                <p className="text-xs text-white/60">
                  {new Date(subscriptionData.subscription.endDate).toLocaleDateString('ko-KR')}까지
                </p>
              )}
            </div>

            {/* 만료 경고 */}
            {subscriptionData.subscription?.status === 'EXPIRED' && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-1">플랜 만료</p>
                    <p className="text-xs text-red-400/80">
                      구독을 갱신해주세요
                    </p>
                    <Link
                      href="/dashboard/settings"
                      className="text-xs text-red-400 underline hover:text-red-300 mt-1 inline-block"
                    >
                      갱신하기 →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 곧 만료 경고 (7일 이내) */}
            {subscriptionData.subscription?.status === 'ACTIVE' &&
              subscriptionData.subscription?.endDate &&
              new Date(subscriptionData.subscription.endDate).getTime() - Date.now() <
                7 * 24 * 60 * 60 * 1000 &&
              new Date(subscriptionData.subscription.endDate).getTime() > Date.now() && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-yellow-400 mb-1">곧 만료</p>
                      <p className="text-xs text-yellow-400/80">
                        {Math.ceil(
                          (new Date(subscriptionData.subscription.endDate).getTime() - Date.now()) /
                            (24 * 60 * 60 * 1000)
                        )}
                        일 후 만료됩니다
                      </p>
                      <Link
                        href="/dashboard/settings"
                        className="text-xs text-yellow-400 underline hover:text-yellow-300 mt-1 inline-block"
                      >
                        갱신하기 →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

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
            href="/dashboard/inquiries"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span>문의 내역</span>
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

