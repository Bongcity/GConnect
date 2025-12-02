'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueStats {
  activeSubscriptions: number;
  totalSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  arpu: number;
}

interface PlanStat {
  planName: string;
  count: number;
  monthlyRevenue: number;
}

export default function RevenuePage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [planStats, setPlanStats] = useState<PlanStat[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      const [statsRes, chartRes] = await Promise.all([
        fetch(`/api/admin/revenue/stats?period=${period}`),
        fetch('/api/admin/revenue/chart?months=6'),
      ]);

      if (statsRes.ok && chartRes.ok) {
        const statsData = await statsRes.json();
        const chartDataRes = await chartRes.json();

        setStats(statsData.stats);
        setPlanStats(statsData.planStats);
        setChartData(chartDataRes);
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">매출 관리</h1>
          <p className="text-white/60">구독 수익 및 결제 내역 관리</p>
        </div>

        {/* 기간 선택 */}
        <div className="flex gap-2">
          {[
            { value: 'month', label: '이번 달' },
            { value: 'last_month', label: '지난 달' },
            { value: '3months', label: '최근 3개월' },
            { value: 'year', label: '올해' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setPeriod(item.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                period === item.value
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-white/60 text-sm mb-1">월간 수익</p>
          <p className="text-3xl font-bold text-white">
            {stats?.monthlyRevenue.toLocaleString()}원
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-white/60 text-sm mb-1">연간 예상 수익</p>
          <p className="text-3xl font-bold text-white">
            {stats?.yearlyRevenue.toLocaleString()}원
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <UserGroupIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-white/60 text-sm mb-1">활성 구독</p>
          <p className="text-3xl font-bold text-white">
            {stats?.activeSubscriptions}
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30">
              <ChartBarIcon className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <p className="text-white/60 text-sm mb-1">평균 ARPU</p>
          <p className="text-3xl font-bold text-white">
            {stats?.arpu.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 월별 수익 추이 */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">월별 수익 추이</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData?.monthlyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="month" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f2e',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                name="수익 (원)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 플랜별 수익 분포 */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">플랜별 수익 분포</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData?.planDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.count}명`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {(chartData?.planDistribution || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f2e',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 플랜별 상세 */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">플랜별 상세</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  플랜
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  구독자 수
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  월간 수익
                </th>
              </tr>
            </thead>
            <tbody>
              {planStats.map((plan) => (
                <tr
                  key={plan.planName}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-white">{plan.planName}</td>
                  <td className="px-6 py-4 text-white/80">{plan.count}명</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">
                    {plan.monthlyRevenue.toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

