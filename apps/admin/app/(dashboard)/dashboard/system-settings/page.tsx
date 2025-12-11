'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SystemSettings {
  id: string;
  showDdroProducts: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/system-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: '설정을 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (field: keyof Pick<SystemSettings, 'showDdroProducts' | 'maintenanceMode'>, value: boolean) => {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/system-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, [field]: value }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
        
        // 3초 후 메시지 자동 제거
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      setMessage({ type: 'error', text: '설정 저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">시스템 설정</h1>
        <p className="text-white/60">
          전체 시스템의 동작을 제어하는 전역 설정을 관리합니다
        </p>
      </div>

      {/* 저장 메시지 */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircleIcon className="w-6 h-6" />
          ) : (
            <XCircleIcon className="w-6 h-6" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 설정 카드 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 space-y-8">
        {/* DDRo 상품 표시 설정 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              DDRo 제휴 상품 표시
            </h3>
            <p className="text-white/60 text-sm mb-3">
              Product 사이트에서 DDRo 데이터베이스의 제휴 상품을 표시합니다.
              <br />
              OFF로 설정하면 Seller 상품만 표시됩니다.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/50">현재 상태:</span>
              {settings?.showDdroProducts ? (
                <span className="text-green-400 font-medium">표시 중</span>
              ) : (
                <span className="text-gray-400 font-medium">숨김</span>
              )}
            </div>
          </div>
          <button
            onClick={() => handleToggle('showDdroProducts', !settings?.showDdroProducts)}
            disabled={saving}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              settings?.showDdroProducts ? 'bg-green-500' : 'bg-gray-600'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                settings?.showDdroProducts ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-white/10"></div>

        {/* 유지보수 모드 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              유지보수 모드
            </h3>
            <p className="text-white/60 text-sm mb-3">
              모든 사이트를 유지보수 모드로 전환합니다.
              <br />
              ON으로 설정하면 일반 사용자는 접속할 수 없습니다.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/50">현재 상태:</span>
              {settings?.maintenanceMode ? (
                <span className="text-red-400 font-medium">유지보수 중</span>
              ) : (
                <span className="text-green-400 font-medium">정상 운영</span>
              )}
            </div>
          </div>
          <button
            onClick={() => handleToggle('maintenanceMode', !settings?.maintenanceMode)}
            disabled={saving}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              settings?.maintenanceMode ? 'bg-red-500' : 'bg-gray-600'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                settings?.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 정보 카드 */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h4 className="text-blue-400 font-semibold mb-2">ℹ️ 설정 변경 시 유의사항</h4>
        <ul className="text-blue-300/80 text-sm space-y-2">
          <li>• DDRo 상품 표시 설정은 즉시 반영됩니다.</li>
          <li>• 유지보수 모드는 관리자를 제외한 모든 사용자의 접속을 차단합니다.</li>
          <li>• 설정 변경 내역은 시스템 로그에 기록됩니다.</li>
        </ul>
      </div>

      {/* 마지막 업데이트 시간 */}
      {settings && (
        <div className="mt-6 text-center text-white/40 text-sm">
          마지막 업데이트: {new Date(settings.updatedAt).toLocaleString('ko-KR')}
        </div>
      )}
    </div>
  );
}

