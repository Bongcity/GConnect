'use client';

import { useEffect, useState } from 'react';
import {
  UsersIcon,
  ShoppingBagIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  recentSyncs: number;
}

interface AnalyticsData {
  signupTrend: { date: string; count: number }[];
  productTrend: { date: string; count: number }[];
  exposureRate: number;
  syncTrend: { date: string; successRate: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('통계 데이터 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics/overview');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('분석 데이터 조회 실패:', error);
    }
  };

  const statCards = [
    {
      title: '전체 사용자',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'blue',
      description: '등록된 판매자 수',
    },
    {
      title: '활성 사용자',
      value: stats?.activeUsers || 0,
      icon: ChartBarIcon,
      color: 'green',
      description: '활성 상태인 판매자',
    },
    {
      title: '전체 상품',
      value: stats?.totalProducts || 0,
      icon: ShoppingBagIcon,
      color: 'purple',
      description: '등록된 상품 수',
    },
    {
      title: '최근 동기화',
      value: stats?.recentSyncs || 0,
      icon: ClockIcon,
      color: 'orange',
      description: '오늘 동기화 횟수',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
        <p className="text-white/60">
          GConnect 플랫폼 전체 통계 및 모니터링
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="glass-card p-6 hover:scale-105 transition-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-${card.color}-500/20 border border-${card.color}-500/30`}
              >
                <card.icon className={`w-6 h-6 text-${card.color}-400`} />
              </div>
              <span className="text-2xl font-bold">{card.value}</span>
            </div>
            <h3 className="text-white/80 font-medium mb-1">{card.title}</h3>
            <p className="text-white/50 text-sm">{card.description}</p>
          </div>
        ))}
      </div>

      {/* 추이 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 회원 가입 추이 */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">회원 가입 추이 (최근 30일)</h2>
          {analytics?.signupTrend ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.signupTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff80"
                    tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                  />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1f2e',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-white/60 text-center py-8">로딩 중...</div>
          )}
        </div>

        {/* 상품 등록 추이 */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">상품 등록 추이 (최근 30일)</h2>
          {analytics?.productTrend ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.productTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff80"
                    tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                  />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1f2e',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ fill: '#a855f7' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-white/60 text-center py-8">로딩 중...</div>
          )}
        </div>
      </div>

      {/* 추가 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google 노출률 */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Google 노출률</h2>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-6xl font-bold text-green-400">
                {analytics?.exposureRate || 0}%
              </p>
              <p className="text-white/60 mt-2">전체 상품 중 Google 노출 비율</p>
            </div>
          </div>
        </div>

        {/* 동기화 성공률 추이 */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">동기화 성공률 (최근 30일)</h2>
          {analytics?.syncTrend ? (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.syncTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff80"
                    tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                    hide
                  />
                  <YAxis stroke="#ffffff80" domain={[0, 100]} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1f2e',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-white/60 text-center py-8">로딩 중...</div>
          )}
        </div>
      </div>
    </div>
  );
}

