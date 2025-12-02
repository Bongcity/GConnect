'use client';

import { useState, useEffect } from 'react';
import { BellIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface NotificationSettings {
  id: string;
  syncFailureEnabled: boolean;
  paymentFailureEnabled: boolean;
  planExpiryEnabled: boolean;
  inquiryEnabled: boolean;
  emailEnabled: boolean;
  emailAddress: string | null;
  slackWebhook: string | null;
  discordWebhook: string | null;
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/notifications/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert('설정이 저장되었습니다.');
      } else {
        alert('설정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">설정을 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">알림 설정</h1>
        <p className="text-white/60">알림 규칙 및 채널 설정</p>
      </div>

      {/* 알림 유형 설정 */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BellIcon className="w-6 h-6" />
          알림 유형
        </h2>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div>
              <p className="text-white font-medium">동기화 실패 알림</p>
              <p className="text-sm text-white/60">동기화 작업이 실패했을 때 알림</p>
            </div>
            <input
              type="checkbox"
              checked={settings.syncFailureEnabled}
              onChange={(e) =>
                setSettings({ ...settings, syncFailureEnabled: e.target.checked })
              }
              className="w-6 h-6 rounded border-white/20 bg-white/5"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div>
              <p className="text-white font-medium">결제 실패 알림</p>
              <p className="text-sm text-white/60">결제 처리가 실패했을 때 알림</p>
            </div>
            <input
              type="checkbox"
              checked={settings.paymentFailureEnabled}
              onChange={(e) =>
                setSettings({ ...settings, paymentFailureEnabled: e.target.checked })
              }
              className="w-6 h-6 rounded border-white/20 bg-white/5"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div>
              <p className="text-white font-medium">플랜 만료 알림</p>
              <p className="text-sm text-white/60">구독 플랜 만료 7일 전 알림</p>
            </div>
            <input
              type="checkbox"
              checked={settings.planExpiryEnabled}
              onChange={(e) =>
                setSettings({ ...settings, planExpiryEnabled: e.target.checked })
              }
              className="w-6 h-6 rounded border-white/20 bg-white/5"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div>
              <p className="text-white font-medium">신규 문의 알림</p>
              <p className="text-sm text-white/60">새로운 문의가 접수되었을 때 알림</p>
            </div>
            <input
              type="checkbox"
              checked={settings.inquiryEnabled}
              onChange={(e) =>
                setSettings({ ...settings, inquiryEnabled: e.target.checked })
              }
              className="w-6 h-6 rounded border-white/20 bg-white/5"
            />
          </label>
        </div>
      </div>

      {/* 알림 채널 설정 */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <EnvelopeIcon className="w-6 h-6" />
          알림 채널
        </h2>

        <div className="space-y-6">
          {/* 이메일 알림 */}
          <div>
            <label className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                checked={settings.emailEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, emailEnabled: e.target.checked })
                }
                className="w-5 h-5 rounded border-white/20 bg-white/5"
              />
              <span className="text-white font-medium">이메일 알림 활성화</span>
            </label>
            {settings.emailEnabled && (
              <input
                type="email"
                value={settings.emailAddress || ''}
                onChange={(e) =>
                  setSettings({ ...settings, emailAddress: e.target.value })
                }
                placeholder="알림 받을 이메일 주소"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-red-400/50"
              />
            )}
          </div>

          {/* Slack 웹훅 */}
          <div>
            <label className="block text-white font-medium mb-3">Slack 웹훅 URL</label>
            <input
              type="url"
              value={settings.slackWebhook || ''}
              onChange={(e) =>
                setSettings({ ...settings, slackWebhook: e.target.value })
              }
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-red-400/50"
            />
          </div>

          {/* Discord 웹훅 */}
          <div>
            <label className="block text-white font-medium mb-3">Discord 웹훅 URL</label>
            <input
              type="url"
              value={settings.discordWebhook || ''}
              onChange={(e) =>
                setSettings({ ...settings, discordWebhook: e.target.value })
              }
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-red-400/50"
            />
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary px-8 py-3"
        >
          {isSaving ? '저장 중...' : '설정 저장'}
        </button>
      </div>
    </div>
  );
}

