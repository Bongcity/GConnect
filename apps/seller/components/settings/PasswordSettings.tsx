'use client';

import { useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function PasswordSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // 비밀번호 확인
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      setIsLoading(false);
      return;
    }

    // 비밀번호 강도 검증
    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 최소 8자 이상이어야 합니다.' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '비밀번호 변경에 실패했습니다.');
      }

      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      
      // 폼 초기화
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">비밀번호 변경</h2>
        <p className="text-white/60">안전한 비밀번호로 계정을 보호하세요</p>
      </div>

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
        {/* 현재 비밀번호 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            현재 비밀번호 *
          </label>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="현재 비밀번호"
              required
            />
          </div>
        </div>

        {/* 새 비밀번호 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            새 비밀번호 *
          </label>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="새 비밀번호 (8자 이상)"
              required
            />
          </div>
          <p className="mt-1 text-xs text-white/50">
            대문자, 소문자, 숫자를 각각 1개 이상 포함해야 합니다
          </p>
        </div>

        {/* 새 비밀번호 확인 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            새 비밀번호 확인 *
          </label>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="새 비밀번호 확인"
              required
            />
          </div>
        </div>

        {/* 보안 팁 */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <h3 className="text-sm font-semibold text-white mb-2">
            💡 안전한 비밀번호 만들기
          </h3>
          <ul className="text-xs text-white/70 space-y-1">
            <li>• 최소 8자 이상</li>
            <li>• 대문자와 소문자 조합</li>
            <li>• 숫자 포함</li>
            <li>• 특수문자 사용 권장</li>
            <li>• 개인 정보와 관련 없는 비밀번호</li>
          </ul>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </form>
    </div>
  );
}

