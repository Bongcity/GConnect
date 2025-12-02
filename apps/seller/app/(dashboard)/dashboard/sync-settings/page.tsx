'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SyncSchedule {
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

const CRON_PRESETS = [
  { label: '매 4시간마다', value: '0 */4 * * *', description: '하루 6회 동기화 (권장)' },
  { label: '매 6시간마다', value: '0 */6 * * *', description: '하루 4회 동기화' },
  { label: '매 12시간마다', value: '0 */12 * * *', description: '하루 2회 동기화' },
  { label: '매일 새벽 2시', value: '0 2 * * *', description: '하루 1회 동기화' },
];

export default function SyncSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [schedule, setSchedule] = useState<SyncSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 스케줄 설정 로드
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSchedule();
    }
  }, [status]);

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

  const handleToggleEnabled = async () => {
    if (!schedule) return;

    setSaving(true);
    try {
      const response = await fetch('/api/sync-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: !schedule.isEnabled,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule);
        setMessage({
          type: 'success',
          text: schedule.isEnabled ? '자동 동기화가 비활성화되었습니다.' : '자동 동기화가 활성화되었습니다.',
        });
      } else {
        throw new Error('Failed to update schedule');
      }
    } catch (error) {
      setMessage({ type: 'error', text: '설정 저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSchedule = async (updates: Partial<SyncSchedule>) => {
    setSaving(true);
    try {
      const response = await fetch('/api/sync-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule);
        setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
      } else {
        throw new Error('Failed to update schedule');
      }
    } catch (error) {
      setMessage({ type: 'error', text: '설정 저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const response = await fetch('/api/products/sync', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({
          type: 'success',
          text: `동기화 완료: ${data.synced}개 성공, ${data.failed}개 실패`,
        });
        await fetchSchedule(); // 통계 업데이트
      } else {
        const data = await response.json();
        throw new Error(data.message || '동기화 실패');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '동기화에 실패했습니다.' });
    } finally {
      setSyncing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">스케줄 설정을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">자동 동기화 설정</h1>
        <p className="mt-2 text-gray-600">네이버 스마트스토어 상품을 자동으로 동기화합니다.</p>
      </div>

      {/* 메시지 */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 자동 동기화 ON/OFF */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">자동 동기화</h2>
            <p className="mt-1 text-sm text-gray-600">
              {schedule.isEnabled ? '자동 동기화가 활성화되어 있습니다.' : '자동 동기화가 비활성화되어 있습니다.'}
            </p>
          </div>
          <button
            onClick={handleToggleEnabled}
            disabled={saving}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              schedule.isEnabled ? 'bg-blue-600' : 'bg-gray-300'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                schedule.isEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 동기화 주기 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">동기화 주기</h2>
        <div className="space-y-3">
          {CRON_PRESETS.map((preset) => (
            <label
              key={preset.value}
              className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="cronExpression"
                value={preset.value}
                checked={schedule.cronExpression === preset.value}
                onChange={(e) => handleUpdateSchedule({ cronExpression: e.target.value })}
                className="h-4 w-4 text-blue-600"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900">{preset.label}</div>
                <div className="text-sm text-gray-600">{preset.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 알림 설정 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">알림 설정</h2>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={schedule.notifyOnError}
              onChange={(e) => handleUpdateSchedule({ notifyOnError: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="ml-3 text-gray-900">동기화 실패 시 알림 받기</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={schedule.notifyOnSuccess}
              onChange={(e) => handleUpdateSchedule({ notifyOnSuccess: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="ml-3 text-gray-900">동기화 성공 시 알림 받기</span>
          </label>
        </div>
      </div>

      {/* 통계 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">동기화 통계</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{schedule.totalRuns}</div>
            <div className="text-sm text-gray-600">총 실행</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{schedule.successRuns}</div>
            <div className="text-sm text-gray-600">성공</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{schedule.failedRuns}</div>
            <div className="text-sm text-gray-600">실패</div>
          </div>
        </div>
        {schedule.lastRun && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">마지막 동기화:</span>
              <span className="font-medium text-gray-900">
                {new Date(schedule.lastRun).toLocaleString('ko-KR')}
              </span>
            </div>
            {schedule.nextRun && (
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">다음 동기화:</span>
                <span className="font-medium text-gray-900">
                  {new Date(schedule.nextRun).toLocaleString('ko-KR')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 수동 동기화 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">수동 동기화</h2>
        <p className="text-gray-600 mb-4">지금 즉시 상품을 동기화합니다.</p>
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {syncing ? '동기화 중...' : '지금 동기화'}
        </button>
      </div>
    </div>
  );
}

