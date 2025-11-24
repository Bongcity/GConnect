'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ProfileSettings() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            email: data.email || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '저장에 실패했습니다.');
      }

      setMessage({ type: 'success', text: '프로필이 저장되었습니다.' });
      
      // 세션 업데이트
      await update();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
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
        <h2 className="text-2xl font-bold text-white mb-2">프로필</h2>
        <p className="text-white/60">개인 정보를 수정하세요</p>
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
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            이름 *
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="홍길동"
              required
            />
          </div>
        </div>

        {/* 이메일 (읽기 전용) */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            이메일
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="email"
              value={formData.email}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 placeholder:text-white/40 cursor-not-allowed"
              disabled
            />
          </div>
          <p className="mt-1 text-xs text-white/50">
            이메일은 변경할 수 없습니다
          </p>
        </div>

        {/* 네이버 연동 정보 (있는 경우) */}
        {session?.user?.email && session.user.email.includes('naver') && (
          <div className="p-4 rounded-xl bg-[#03C75A]/10 border border-[#03C75A]/20">
            <p className="text-sm text-white/80">
              ✅ 네이버 계정으로 연동되어 있습니다
            </p>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

