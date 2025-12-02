'use client';

import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';

interface SyncSchedule {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    shopName: string;
  };
  isEnabled: boolean;
  cronExpression: string;
  timezone: string;
  syncProducts: boolean;
  updateFeed: boolean;
  notifyOnSuccess: boolean;
  notifyOnError: boolean;
  notifyEmail: string | null;
  lastRun: string | null;
  lastStatus: string | null;
  nextRun: string | null;
  totalRuns: number;
  successRuns: number;
  failedRuns: number;
  createdAt: string;
  updatedAt: string;
}

export default function SyncMonitorPage() {
  const [schedules, setSchedules] = useState<SyncSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/admin/sync-schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링된 스케줄
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.user.shopName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'enabled' && schedule.isEnabled) ||
      (filterStatus === 'disabled' && !schedule.isEnabled);
    return matchesSearch && matchesStatus;
  });

  // Cron 표현식을 한글로 변환
  const getCronDescription = (cron: string) => {
    const cronMap: { [key: string]: string } = {
      '0 2 * * *': '매일 새벽 2시',
      '0 3 * * *': '매일 새벽 3시',
      '0 */12 * * *': '12시간마다',
      '0 */6 * * *': '6시간마다',
      '0 */3 * * *': '3시간마다',
      '0 * * * *': '1시간마다',
    };
    return cronMap[cron] || cron;
  };

  // 상태 배지
  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">
          미실행
        </span>
      );
    }
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircleIcon className="w-3 h-3" />
            성공
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircleIcon className="w-3 h-3" />
            실패
          </span>
        );
      default:
        return null;
    }
  };

  // 통계
  const stats = {
    total: schedules.length,
    enabled: schedules.filter((s) => s.isEnabled).length,
    disabled: schedules.filter((s) => !s.isEnabled).length,
    totalRuns: schedules.reduce((sum, s) => sum + s.totalRuns, 0),
    successRate:
      schedules.reduce((sum, s) => sum + s.totalRuns, 0) > 0
        ? (schedules.reduce((sum, s) => sum + s.successRuns, 0) /
            schedules.reduce((sum, s) => sum + s.totalRuns, 0)) *
          100
        : 0,
  };

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">동기화 모니터</h1>
        <p className="text-white/60">전체 사용자의 자동 동기화 스케줄을 모니터링합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">전체 스케줄</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">활성화</p>
          <p className="text-3xl font-bold text-green-400">{stats.enabled}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">비활성화</p>
          <p className="text-3xl font-bold text-gray-400">{stats.disabled}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">총 실행 횟수</p>
          <p className="text-3xl font-bold text-brand-cyan">{stats.totalRuns}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/60 mb-2">성공률</p>
          <p className="text-3xl font-bold text-brand-neon">{stats.successRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* 필터 & 검색 */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="사용자 이름, 이메일, 상점명 검색..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50"
            />
          </div>

          {/* 상태 필터 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-neon/50"
          >
            <option value="all">전체 상태</option>
            <option value="enabled">활성화</option>
            <option value="disabled">비활성화</option>
          </select>
        </div>
      </div>

      {/* 스케줄 목록 */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">사용자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">스케줄</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">옵션</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">마지막 실행</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">다음 실행</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">통계</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/60">
                    스케줄 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{schedule.user.name}</p>
                        <p className="text-sm text-white/60">{schedule.user.email}</p>
                        {schedule.user.shopName && (
                          <p className="text-xs text-white/50">{schedule.user.shopName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {schedule.isEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                          <PlayIcon className="w-3 h-3" />
                          활성
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          <PauseIcon className="w-3 h-3" />
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">{getCronDescription(schedule.cronExpression)}</p>
                        <p className="text-white/50 text-xs">{schedule.cronExpression}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {schedule.syncProducts && (
                          <span className="text-brand-neon">• 상품 동기화</span>
                        )}
                        {schedule.updateFeed && (
                          <span className="text-brand-cyan">• 피드 업데이트</span>
                        )}
                        {schedule.notifyOnError && (
                          <span className="text-white/50">• 오류 알림</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {schedule.lastRun ? (
                          <>
                            <p className="text-white/70">
                              {new Date(schedule.lastRun).toLocaleString('ko-KR')}
                            </p>
                            {getStatusBadge(schedule.lastStatus)}
                          </>
                        ) : (
                          <span className="text-white/50">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white/70">
                        {schedule.nextRun
                          ? new Date(schedule.nextRun).toLocaleString('ko-KR')
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">
                          총 {schedule.totalRuns}회
                        </p>
                        <p className="text-green-400 text-xs">
                          성공 {schedule.successRuns}
                        </p>
                        <p className="text-red-400 text-xs">
                          실패 {schedule.failedRuns}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 안내 */}
      <div className="mt-8 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">
          💡 동기화 모니터 안내
        </h3>
        <ul className="text-xs text-white/70 space-y-1 ml-4 list-disc">
          <li>각 사용자의 자동 동기화 스케줄 설정을 확인할 수 있습니다</li>
          <li>실행 통계를 통해 시스템 안정성을 모니터링할 수 있습니다</li>
          <li>다음 실행 시간을 확인하여 서버 부하를 예측할 수 있습니다</li>
          <li>사용자는 Seller 사이트의 "자동 동기화" 메뉴에서 직접 설정을 변경합니다</li>
        </ul>
      </div>
    </div>
  );
}

