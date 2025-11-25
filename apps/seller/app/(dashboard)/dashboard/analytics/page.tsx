'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CursorArrowRaysIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    totalProducts: number;
    activeProducts: number;
    exposedProducts: number;
  };
  dailyData: Array<{
    date: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  trafficSources: {
    organic: number;
    direct: number;
    referral: number;
  };
}

const PERIOD_OPTIONS = [
  { label: '7일', days: 7 },
  { label: '30일', days: 30 },
  { label: '90일', days: 90 },
];

const COLORS = ['#22F089', '#00D9FF', '#8B5CF6'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics?days=${period}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  // 트래픽 소스 차트 데이터
  const trafficData = [
    { name: '자연 검색', value: data.trafficSources.organic },
    { name: '직접 방문', value: data.trafficSources.direct },
    { name: '추천', value: data.trafficSources.referral },
  ];

  return (
    <div className="max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">성과 분석</h1>
            <p className="text-white/60">구글 검색 노출 및 트래픽 통계를 확인하세요</p>
          </div>

          {/* 기간 선택 */}
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.days}
                onClick={() => setPeriod(option.days)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === option.days
                    ? 'bg-brand-neon text-brand-navy'
                    : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/60">총 노출</p>
            <ChartBarIcon className="w-5 h-5 text-brand-cyan" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {data.summary.totalImpressions.toLocaleString()}
          </p>
          <p className="text-xs text-white/50">구글 검색 결과 노출 수</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/60">총 클릭</p>
            <CursorArrowRaysIcon className="w-5 h-5 text-brand-neon" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {data.summary.totalClicks.toLocaleString()}
          </p>
          <p className="text-xs text-white/50">구글에서 유입된 클릭</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/60">평균 CTR</p>
            <ArrowTrendingUpIcon className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{data.summary.avgCtr}%</p>
          <p className="text-xs text-white/50">클릭률 (Click Through Rate)</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/60">구글 노출 상품</p>
            <ShoppingBagIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {data.summary.exposedProducts} / {data.summary.totalProducts}
          </p>
          <p className="text-xs text-white/50">전체 상품 중 노출 상품</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 노출 & 클릭 추이 */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">노출 & 클릭 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(5, 8, 22, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="impressions"
                name="노출"
                stroke="#00D9FF"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                name="클릭"
                stroke="#22F089"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 트래픽 소스 */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">트래픽 소스</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trafficData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {trafficData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(5, 8, 22, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-8 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-2">
          📊 분석 데이터에 대하여
        </h3>
        <p className="text-sm text-white/70 mb-2">
          현재 표시되는 데이터는 시뮬레이션 데이터입니다.
        </p>
        <p className="text-sm text-white/70">
          실제 구글 검색 성과를 확인하려면 Google Search Console과 연동하거나,
          Google Merchant Center 연동 후 자동으로 데이터가 수집됩니다.
        </p>
      </div>
    </div>
  );
}


