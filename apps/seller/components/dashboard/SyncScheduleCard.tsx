'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClockIcon, CheckCircleIcon, XCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface SyncSchedule {
  id: string;
  isEnabled: boolean;
  cronExpression: string;
  lastRun: string | null;
  lastStatus: string | null;
  nextRun: string | null;
  totalRuns: number;
  successRuns: number;
  failedRuns: number;
}

export default function SyncScheduleCard() {
  const [schedule, setSchedule] = useState<SyncSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/sync-schedule');
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      case 'PARTIAL':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimeRemaining = (nextRun: string | null) => {
    if (!nextRun) return null;
    
    const now = new Date();
    const next = new Date(nextRun);
    const diff = next.getTime() - now.getTime();
    
    if (diff < 0) return '곧 시작';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 후`;
    }
    return `${minutes}분 후`;
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">자동 동기화</h3>
          </div>
          <Link
            href="/dashboard/sync-settings"
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* 상태 */}
        <div className="space-y-3">
          {/* 활성화 상태 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">상태</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                schedule.isEnabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {schedule.isEnabled ? '활성화' : '비활성화'}
            </span>
          </div>

          {/* 마지막 동기화 */}
          {schedule.lastRun && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">마지막 동기화</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(schedule.lastStatus)}
                <span className="text-sm font-medium text-gray-900">
                  {new Date(schedule.lastRun).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )}

          {/* 다음 동기화 */}
          {schedule.isEnabled && schedule.nextRun && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">다음 동기화</span>
              <span className="text-sm font-medium text-blue-600">
                {formatTimeRemaining(schedule.nextRun)}
              </span>
            </div>
          )}

          {/* 통계 */}
          <div className="pt-3 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{schedule.totalRuns}</div>
                <div className="text-xs text-gray-600">총 실행</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{schedule.successRuns}</div>
                <div className="text-xs text-gray-600">성공</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{schedule.failedRuns}</div>
                <div className="text-xs text-gray-600">실패</div>
              </div>
            </div>
          </div>
        </div>

        {/* 설정 링크 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/sync-settings"
            className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            동기화 설정 관리
          </Link>
        </div>
      </div>
    </div>
  );
}

