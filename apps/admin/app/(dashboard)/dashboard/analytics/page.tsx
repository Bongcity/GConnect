'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ConversionData {
  planName: string;
  trials: number;
  conversions: number;
  conversionRate: number;
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/analytics/conversion?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setConversionData(data.conversionData || []);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // CSV 내보내기 로직
    const csvContent = [
      ['플랜', '체험 사용자', '전환 사용자', '전환율(%)'],
      ...conversionData.map((item) => [
        item.planName,
        item.trials,
        item.conversions,
        item.conversionRate,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const COLORS = ['#3b82f6', '#a855f7', '#f97316'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">상세 분석</h1>
          <p className="text-white/60">플랜 전환율 및 사용자 활동 분석</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 rounded-xl bg-[#1a1f2e] border border-white/20 text-white focus:outline-none"
          >
            <option value="month">이번 달</option>
            <option value="quarter">최근 3개월</option>
            <option value="year">최근 1년</option>
          </select>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <ArrowDownTrayIcon className="w-5 h-5" />
            CSV 내보내기
          </button>
        </div>
      </div>

      {/* 플랜별 전환율 */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">플랜별 전환율</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 막대 차트 */}
          <div>
            <h3 className="text-lg font-semibold text-white/80 mb-4">
              체험 vs 전환 사용자
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                  <XAxis dataKey="planName" stroke="#ffffff80" />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1f2e',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="trials" fill="#3b82f6" name="체험 사용자" />
                  <Bar dataKey="conversions" fill="#10b981" name="전환 사용자" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 파이 차트 */}
          <div>
            <h3 className="text-lg font-semibold text-white/80 mb-4">플랜별 분포</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionData}
                    dataKey="conversions"
                    nameKey="planName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.planName}: ${entry.conversions}`}
                  >
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1f2e',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 전환율 테이블 */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white/80 mb-4">전환율 상세</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">
                  플랜
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-white/80">
                  체험 사용자
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-white/80">
                  전환 사용자
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-white/80">
                  전환율
                </th>
              </tr>
            </thead>
            <tbody>
              {conversionData.map((item) => (
                <tr key={item.planName} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white">{item.planName}</td>
                  <td className="px-4 py-3 text-right text-white/80">{item.trials}</td>
                  <td className="px-4 py-3 text-right text-white/80">{item.conversions}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-green-400 font-semibold">
                      {item.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 비교 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">전월 대비</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-400">+12.5%</p>
            <p className="text-white/60 mt-2">신규 가입 증가</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">평균 전환율</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400">
              {conversionData.length > 0
                ? Math.round(
                    conversionData.reduce((sum, item) => sum + item.conversionRate, 0) /
                      conversionData.length
                  )
                : 0}
              %
            </p>
            <p className="text-white/60 mt-2">전체 플랜 평균</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">이탈률</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-orange-400">8.3%</p>
            <p className="text-white/60 mt-2">체험 후 이탈</p>
          </div>
        </div>
      </div>
    </div>
  );
}

