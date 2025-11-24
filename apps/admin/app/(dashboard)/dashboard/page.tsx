'use client';

import { useEffect, useState } from 'react';
import {
  UsersIcon,
  ShoppingBagIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  recentSyncs: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">최근 가입 사용자</h2>
          <div className="text-white/60 text-center py-8">
            API 연결 후 데이터 표시
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">최근 동기화 로그</h2>
          <div className="text-white/60 text-center py-8">
            API 연결 후 데이터 표시
          </div>
        </div>
      </div>
    </div>
  );
}

