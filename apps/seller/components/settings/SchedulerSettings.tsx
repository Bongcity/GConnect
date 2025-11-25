'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  PlayIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface Schedule {
  id: string;
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
}

// Cron 표현식 프리셋
const CRON_PRESETS = [
  { label: '매일 새벽 2시', value: '0 2 * * *', description: '매일 02:00' },
  { label: '매일 새벽 3시', value: '0 3 * * *', description: '매일 03:00' },
  { label: '12시간마다', value: '0 */12 * * *', description: '0시, 12시' },
  { label: '6시간마다', value: '0 */6 * * *', description: '0시, 6시, 12시, 18시' },
  { label: '3시간마다', value: '0 */3 * * *', description: '3시간 간격' },
  { label: '1시간마다', value: '0 * * * *', description: '매시간 정각' },
];

export default function SchedulerSettings() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    isEnabled: false,
    cronExpression: '0 2 * * *',
    timezone: 'Asia/Seoul',
    syncProducts: true,
    updateFeed: true,
    notifyOnSuccess: false,
    notifyOnError: true,
    notifyEmail: '',
  });

  // 스케줄 불러오기
  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/scheduler');
      if (response.ok) {
        const data = await response.json();
        if (data.schedule) {
          setSchedule(data.schedule);
          setFormData({
            isEnabled: data.schedule.isEnabled,
            cronExpression: data.schedule.cronExpression,
            timezone: data.schedule.timezone,
            syncProducts: data.schedule.syncProducts,
            updateFeed: data.schedule.updateFeed,
            notifyOnSuccess: data.schedule.notifyOnSuccess,
            notifyOnError: data.schedule.notifyOnError,
            notifyEmail: data.schedule.notifyEmail || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '저장에 실패했습니다.');
      }

      setSchedule(data.schedule);
      setMessage({
        type: 'success',
        text: formData.isEnabled
          ? '자동 동기화가 활성화되었습니다.'
          : '자동 동기화가 비활성화되었습니다.',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunNow = async () => {
    setIsRunning(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/scheduler/run', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '실행에 실패했습니다.');
      }

      setMessage({
        type: 'success',
        text: '동기화 작업이 시작되었습니다. 잠시 후 결과를 확인하세요.',
      });

      // 3초 후 스케줄 정보 새로고침
      setTimeout(() => {
        fetchSchedule();
      }, 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  if (isFetching) {
    return (
      <div className="text-center py-8">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">자동 동기화 스케줄</h2>
        <p className="text-white/60">
          네이버 상품을 자동으로 동기화하는 일정을 설정하세요
        </p>
      </div>

      {/* 통계 */}
      {schedule && schedule.totalRuns > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <p className="text-xs text-white/50 mb-1">총 실행</p>
            <p className="text-2xl font-bold text-white">{schedule.totalRuns}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-white/50 mb-1">성공</p>
            <p className="text-2xl font-bold text-green-400">{schedule.successRuns}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-white/50 mb-1">실패</p>
            <p className="text-2xl font-bold text-red-400">{schedule.failedRuns}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-white/50 mb-1">마지막 상태</p>
            <div className="flex items-center gap-2 mt-1">
              {schedule.lastStatus === 'SUCCESS' ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-400">성공</span>
                </>
              ) : schedule.lastStatus === 'FAILED' ? (
                <>
                  <XCircleIcon className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-red-400">실패</span>
                </>
              ) : (
                <span className="text-sm text-white/50">-</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 메시지 */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          <p
            className={`text-sm text-center ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 활성화 토글 */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">자동 동기화 활성화</h3>
            <p className="text-sm text-white/60">
              설정한 일정에 따라 자동으로 상품을 동기화합니다
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-neon/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-neon"></div>
          </label>
        </div>

        {/* 동기화 일정 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            <ClockIcon className="w-4 h-4 inline mr-1" />
            동기화 일정
          </label>
          <select
            value={formData.cronExpression}
            onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-neon/50 transition-colors"
            disabled={!formData.isEnabled}
          >
            {CRON_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label} - {preset.description}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-white/50">
            서버 시간(KST) 기준으로 실행됩니다
          </p>
        </div>

        {/* 동기화 옵션 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/80 mb-2">
            동기화 옵션
          </label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="syncProducts"
              checked={formData.syncProducts}
              onChange={(e) =>
                setFormData({ ...formData, syncProducts: e.target.checked })
              }
              className="w-5 h-5 rounded"
              disabled={!formData.isEnabled}
            />
            <label htmlFor="syncProducts" className="text-white">
              상품 동기화
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="updateFeed"
              checked={formData.updateFeed}
              onChange={(e) =>
                setFormData({ ...formData, updateFeed: e.target.checked })
              }
              className="w-5 h-5 rounded"
              disabled={!formData.isEnabled}
            />
            <label htmlFor="updateFeed" className="text-white">
              Google 피드 업데이트
            </label>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/80 mb-2">
            <BellIcon className="w-4 h-4 inline mr-1" />
            알림 설정
          </label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="notifyOnSuccess"
              checked={formData.notifyOnSuccess}
              onChange={(e) =>
                setFormData({ ...formData, notifyOnSuccess: e.target.checked })
              }
              className="w-5 h-5 rounded"
              disabled={!formData.isEnabled}
            />
            <label htmlFor="notifyOnSuccess" className="text-white">
              성공 시 알림 받기
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="notifyOnError"
              checked={formData.notifyOnError}
              onChange={(e) =>
                setFormData({ ...formData, notifyOnError: e.target.checked })
              }
              className="w-5 h-5 rounded"
              disabled={!formData.isEnabled}
            />
            <label htmlFor="notifyOnError" className="text-white">
              실패 시 알림 받기
            </label>
          </div>
        </div>

        {/* 알림 이메일 */}
        {(formData.notifyOnSuccess || formData.notifyOnError) && formData.isEnabled && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              알림 이메일
            </label>
            <input
              type="email"
              value={formData.notifyEmail}
              onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="email@example.com"
            />
            <p className="mt-1 text-xs text-white/50">
              동기화 결과를 받을 이메일 주소 (현재 기능 개발 중)
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-neon flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : '설정 저장'}
          </button>
          <button
            type="button"
            onClick={handleRunNow}
            disabled={isRunning}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="w-4 h-4" />
            {isRunning ? '실행 중...' : '지금 실행'}
          </button>
        </div>
      </form>

      {/* 안내 */}
      <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">
          💡 자동 동기화 작동 방식
        </h3>
        <ul className="text-xs text-white/70 space-y-1 ml-4 list-disc">
          <li>설정한 일정에 따라 자동으로 네이버 상품을 가져옵니다</li>
          <li>새 상품은 추가되고, 기존 상품은 업데이트됩니다</li>
          <li>Google 피드도 자동으로 업데이트되어 최신 상태를 유지합니다</li>
          <li>&apos;지금 실행&apos; 버튼으로 언제든지 수동으로 동기화할 수 있습니다</li>
          <li>동기화 결과는 &apos;동기화 로그&apos;에서 확인할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}

