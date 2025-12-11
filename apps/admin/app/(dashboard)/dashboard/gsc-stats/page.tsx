'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CursorArrowRaysIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

interface GscStats {
  period: number;
  summary: {
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    exposedProducts: number;
    totalProducts: number;
  };
  sellerStats: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    impressions: number;
    clicks: number;
    productCount: number;
    ctr: number;
  }>;
  dailyTrend: Array<{
    date: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  topProducts: Array<{
    productId: number;
    productName: string;
    userName: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
}

const PERIOD_OPTIONS = [
  { label: '7일', days: 7 },
  { label: '30일', days: 30 },
  { label: '90일', days: 90 },
];

export default function GscStatsPage() {
  const [data, setData] = useState<GscStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/gsc-stats?days=${period}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch GSC stats:', error);
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

  return (
    <div className="max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Google Search Console 통계
            </h1>
            <p className="text-white/60">전체 셀러의 구글 검색 성과를 확인하세요</p>
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

      {/* 노출 & 클릭 추이 */}
      <div className="glass-card p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-6">노출 & 클릭 추이</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailyTrend}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 셀러별 성과 (상위 5명) */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <UserGroupIcon className="w-6 h-6 text-brand-cyan" />
            <h3 className="text-xl font-bold text-white">셀러별 성과 (Top 5)</h3>
          </div>
          <div className="space-y-4">
            {data.sellerStats.slice(0, 5).map((seller, index) => (
              <div
                key={seller.userId}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : index === 1
                          ? 'bg-gray-400/20 text-gray-300'
                          : index === 2
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{seller.userName}</p>
                      <p className="text-xs text-white/50">{seller.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-neon">
                      {seller.impressions.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60">노출</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-white/50">클릭</p>
                    <p className="text-white font-semibold">{seller.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/50">CTR</p>
                    <p className="text-white font-semibold">{seller.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-white/50">상품</p>
                    <p className="text-white font-semibold">{seller.productCount}개</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 상위 성과 상품 (Top 5) */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrophyIcon className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">상위 성과 상품 (Top 5)</h3>
          </div>
          <div className="space-y-4">
            {data.topProducts.slice(0, 5).map((product, index) => (
              <div
                key={product.productId}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : index === 1
                          ? 'bg-gray-400/20 text-gray-300'
                          : index === 2
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {product.productName}
                      </p>
                      <p className="text-xs text-white/50">{product.userName}</p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold text-brand-cyan">
                      {product.impressions.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60">노출</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-white/50">클릭</p>
                    <p className="text-white font-semibold">{product.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/50">CTR</p>
                    <p className="text-white font-semibold">{product.ctr}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 전체 셀러 목록 */}
      <div className="glass-card p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-6">전체 셀러 성과</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                  순위
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                  셀러
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-white/80">
                  노출
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-white/80">
                  클릭
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-white/80">
                  CTR
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-white/80">
                  상품 수
                </th>
              </tr>
            </thead>
            <tbody>
              {data.sellerStats.map((seller, index) => (
                <tr key={seller.userId} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-sm text-white/60">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-white font-medium">{seller.userName}</p>
                      <p className="text-xs text-white/50">{seller.userEmail}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-white">
                    {seller.impressions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-white">
                    {seller.clicks.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-white">{seller.ctr}%</td>
                  <td className="py-3 px-4 text-right text-sm text-white">
                    {seller.productCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-2">
          📊 GSC 통계 데이터에 대하여
        </h3>
        <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
          <li>이 데이터는 Google Search Console에서 실시간으로 수집됩니다</li>
          <li>전체 셀러의 구글 검색 성과를 한눈에 확인할 수 있습니다</li>
          <li>데이터는 2~3일 지연될 수 있으며, 매 시간 정각마다 자동으로 업데이트됩니다</li>
          <li>
            셀러별 성과를 비교하여 우수 셀러 발굴 및 성과가 낮은 셀러 지원에 활용하세요
          </li>
        </ul>
      </div>
    </div>
  );
}

