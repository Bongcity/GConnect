'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  RssIcon,
  ClockIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // 30초마다 업데이트
      return () => clearInterval(interval);
    }
  }, [status]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/admin/notifications?isRead=false&pageSize=5');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.totalNotifications || 0);
        setRecentNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
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
            href="/dashboard/subscriptions"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/subscriptions')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCardIcon className="w-5 h-5" />
            <span>구독 관리</span>
          </Link>

          <Link
            href="/dashboard/feed-settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/feed-settings')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <RssIcon className="w-5 h-5" />
            <span>Google 피드</span>
          </Link>

          <Link
            href="/dashboard/sync-monitor"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/sync-monitor')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <ClockIcon className="w-5 h-5" />
            <span>동기화 모니터</span>
          </Link>

          <Link
            href="/dashboard/webhooks"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/webhooks')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <BoltIcon className="w-5 h-5" />
            <span>웹훅 관리</span>
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

          <div className="my-4 border-t border-white/10"></div>

          <Link
            href="/dashboard/revenue"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/revenue')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <CurrencyDollarIcon className="w-5 h-5" />
            <span>매출 관리</span>
          </Link>

          <Link
            href="/dashboard/support"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname?.startsWith('/dashboard/support')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span>고객 지원</span>
          </Link>

          <Link
            href="/dashboard/analytics"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/dashboard/analytics')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>상세 분석</span>
          </Link>

          <Link
            href="/dashboard/notifications"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname?.startsWith('/dashboard/notifications')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <BellIcon className="w-5 h-5" />
            <span>알림 센터</span>
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
      <main className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="h-16 bg-white/5 backdrop-blur-sm border-b border-white/10 px-8 flex items-center justify-end">
          {/* 알림 아이콘 */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <BellIcon className="w-6 h-6 text-white/80" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* 알림 드롭다운 */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 glass-card p-4 z-50 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">최근 알림</h3>
                  <Link
                    href="/dashboard/notifications"
                    className="text-sm text-red-400 hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    모두 보기
                  </Link>
                </div>

                {recentNotifications.length === 0 ? (
                  <p className="text-white/60 text-center py-8">알림이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {recentNotifications.map((notification: any) => (
                      <Link
                        key={notification.id}
                        href="/dashboard/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-1"></span>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white mb-1">
                              {notification.title}
                            </p>
                            <p className="text-xs text-white/60 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* 컨텐츠 */}
        <div className="flex-1 p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

