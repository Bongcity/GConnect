'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';
import SyncScheduleCard from '@/components/dashboard/SyncScheduleCard';
import InquiryModal from '@/components/inquiry/InquiryModal';

interface SubscriptionData {
  subscription: any;
  plan: {
    name: string;
    displayName: string;
    maxProducts: number;
    monthlyPrice: number;
  };
  usage: {
    currentProducts: number;
    maxProducts: number;
    remainingSlots: number;
    usagePercentage: number;
  };
  needsUpgrade: boolean;
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  naverApiConnected: boolean;
  googleExposureCount: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 구독 정보 조회
        const subResponse = await fetch('/api/user/subscription');
        if (subResponse.ok) {
          const data = await subResponse.json();
          setSubscriptionData(data);
        }

        // 대시보드 통계 조회
        const statsResponse = await fetch('/api/dashboard/stats');
        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setDashboardStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

      {/* 구독 플랜 정보 */}
      {!isLoading && subscriptionData && (
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-brand-neon/10 to-brand-cyan/10 border border-brand-neon/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-brand-neon" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {subscriptionData.plan.displayName} 플랜
                </h3>
                <p className="text-sm text-white/60">
                  월 {subscriptionData.plan.monthlyPrice.toLocaleString()}원
                </p>
              </div>
            </div>
            {subscriptionData.needsUpgrade && (
              <Link href="/dashboard/settings" className="btn-neon text-sm flex items-center gap-2">
                <ArrowUpIcon className="w-4 h-4" />
                플랜 업그레이드
              </Link>
            )}
          </div>
          
          {/* 사용량 표시 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">상품 등록 현황</span>
              <span className="text-white font-semibold">
                {subscriptionData.usage.currentProducts} / {subscriptionData.usage.maxProducts}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  subscriptionData.usage.usagePercentage >= 90
                    ? 'bg-red-500'
                    : subscriptionData.usage.usagePercentage >= 70
                    ? 'bg-yellow-500'
                    : 'bg-brand-neon'
                }`}
                style={{ width: `${subscriptionData.usage.usagePercentage}%` }}
              />
            </div>
            <p className="text-xs text-white/50">
              네이버에서 {subscriptionData.usage.remainingSlots}개 더 가져올 수 있습니다
            </p>
          </div>

          {subscriptionData.needsUpgrade && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-400">
                ⚠️ 상품 동기화 한도에 도달했습니다. 네이버에서 더 많은 상품을 가져오려면 플랜을 업그레이드하세요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 상태 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">계정 상태</h3>
            {isLoading ? (
              <ClockIcon className="w-6 h-6 text-white/40 animate-pulse" />
            ) : dashboardStats?.naverApiConnected ? (
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            ) : (
              <ClockIcon className="w-6 h-6 text-yellow-400" />
            )}
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-9 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <p className={`text-3xl font-bold mb-2 ${
                dashboardStats?.naverApiConnected ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {dashboardStats?.naverApiConnected ? '연결됨' : '대기 중'}
              </p>
              <p className="text-sm text-white/60">
                {dashboardStats?.naverApiConnected ? '네이버 API 연결됨' : '설정을 완료해주세요'}
              </p>
            </>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">연결된 상품</h3>
            <CheckCircleIcon className="w-6 h-6 text-brand-neon" />
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-9 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-white mb-2">
                {dashboardStats?.activeProducts || 0}개
              </p>
              <p className="text-sm text-white/60">
                {dashboardStats?.activeProducts 
                  ? `전체 ${dashboardStats.totalProducts}개 중 ${dashboardStats.activeProducts}개 활성화`
                  : '상품을 연결하세요'}
              </p>
            </>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">구글 노출</h3>
            <RocketLaunchIcon className="w-6 h-6 text-brand-cyan" />
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-9 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-white mb-2">
                {dashboardStats?.googleExposureCount || 0}회
              </p>
              <p className="text-sm text-white/60">
                {dashboardStats?.googleExposureCount 
                  ? '최근 30일 노출 수'
                  : '곧 시작됩니다'}
              </p>
            </>
          )}
        </div>

        {/* 자동 동기화 카드 */}
        <div className="md:col-span-2 lg:col-span-1">
          <SyncScheduleCard />
        </div>
      </div>

      {/* 시작 가이드 */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-white mb-6">빠른 시작 가이드</h2>
        
        <div className="space-y-4">
          {/* 1. 네이버 스마트스토어 연결 */}
          <div className={`flex items-start gap-4 p-4 rounded-xl bg-white/5 border ${
            dashboardStats?.naverApiConnected 
              ? 'border-green-500/30 bg-green-500/5' 
              : 'border-white/10'
          }`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              dashboardStats?.naverApiConnected
                ? 'bg-green-500/20'
                : 'bg-brand-neon/20'
            }`}>
              {dashboardStats?.naverApiConnected ? (
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              ) : (
                <span className="text-brand-neon font-bold">1</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                네이버 스마트스토어 연결
              </h3>
              <p className={`mb-3 ${
                dashboardStats?.naverApiConnected ? 'text-green-400' : 'text-white/60'
              }`}>
                {dashboardStats?.naverApiConnected 
                  ? '✅ 연결이 완료되었습니다!' 
                  : '상점 ID 또는 API 키를 입력하여 스마트스토어를 연결하세요.'}
              </p>
              <Link 
                href="/dashboard/settings" 
                className={`${
                  dashboardStats?.naverApiConnected 
                    ? 'btn-secondary' 
                    : 'btn-neon'
                } text-sm inline-block`}
              >
                {dashboardStats?.naverApiConnected ? '연결 다시 하기' : '연결하기'}
              </Link>
            </div>
          </div>

          {/* 2. 상품 동기화 확인 */}
          <div className={`flex items-start gap-4 p-4 rounded-xl bg-white/5 border ${
            (dashboardStats?.totalProducts || 0) > 0
              ? 'border-green-500/30 bg-green-500/5' 
              : dashboardStats?.naverApiConnected
              ? 'border-white/10'
              : 'border-white/10 opacity-50'
          }`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              (dashboardStats?.totalProducts || 0) > 0
                ? 'bg-green-500/20'
                : dashboardStats?.naverApiConnected
                ? 'bg-brand-neon/20'
                : 'bg-white/10'
            }`}>
              {(dashboardStats?.totalProducts || 0) > 0 ? (
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              ) : (
                <span className={`font-bold ${
                  dashboardStats?.naverApiConnected ? 'text-brand-neon' : 'text-white/60'
                }`}>2</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${
                (dashboardStats?.totalProducts || 0) > 0 || dashboardStats?.naverApiConnected
                  ? 'text-white' 
                  : 'text-white/60'
              }`}>
                상품 동기화 확인
              </h3>
              <p className={`mb-3 ${
                (dashboardStats?.totalProducts || 0) > 0
                  ? 'text-green-400'
                  : dashboardStats?.naverApiConnected
                  ? 'text-white/60'
                  : 'text-white/40'
              }`}>
                {(dashboardStats?.totalProducts || 0) > 0
                  ? `✅ ${dashboardStats?.totalProducts}개 상품이 동기화되었습니다!`
                  : '네이버 API 연결 후 자동으로 상품이 수집되고 SEO 구조로 변환됩니다.'}
              </p>
              {dashboardStats?.naverApiConnected && (dashboardStats?.totalProducts || 0) === 0 && (
                <Link href="/dashboard/products" className="btn-neon text-sm inline-block">
                  상품 가져오기
                </Link>
              )}
              {(dashboardStats?.totalProducts || 0) > 0 && (
                <Link href="/dashboard/products" className="btn-secondary text-sm inline-block">
                  상품 관리하기
                </Link>
              )}
            </div>
          </div>

          {/* 3. 구글 검색 노출 시작 */}
          <div className={`flex items-start gap-4 p-4 rounded-xl bg-white/5 border ${
            (dashboardStats?.totalProducts || 0) > 0
              ? 'border-white/10'
              : 'border-white/10 opacity-50'
          }`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              (dashboardStats?.totalProducts || 0) > 0
                ? 'bg-brand-cyan/20'
                : 'bg-white/10'
            }`}>
              <span className={`font-bold ${
                (dashboardStats?.totalProducts || 0) > 0 ? 'text-brand-cyan' : 'text-white/60'
              }`}>3</span>
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${
                (dashboardStats?.totalProducts || 0) > 0 ? 'text-white' : 'text-white/60'
              }`}>
                구글 검색 노출 시작
              </h3>
              <p className={
                (dashboardStats?.totalProducts || 0) > 0 ? 'text-white/60' : 'text-white/40'
              }>
                {(dashboardStats?.totalProducts || 0) > 0
                  ? '🚀 상품이 구글 검색에 자동으로 노출되기 시작합니다. 24시간 내에 결과를 확인하세요!'
                  : '상품 동기화 후 24시간 내에 구글 검색에 노출되기 시작합니다.'}
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
        <button 
          onClick={() => setShowInquiryModal(true)}
          className="btn-secondary text-sm"
        >
          문의하기
        </button>
      </div>

      {/* 문의하기 모달 */}
      <InquiryModal 
        isOpen={showInquiryModal} 
        onClose={() => setShowInquiryModal(false)} 
      />
    </div>
  );
}

