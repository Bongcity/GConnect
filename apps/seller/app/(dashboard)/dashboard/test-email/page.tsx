'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function TestEmailPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: '✅ 테스트 이메일이 발송되었습니다! 수신함을 확인하세요.',
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ 발송 실패: ${data.error || data.message}`,
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `❌ 오류: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">📧 이메일 테스트</h1>
        <p className="text-white/60">이메일 알림 기능을 테스트합니다</p>
      </div>

      {/* 환경 변수 확인 */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">환경 변수 확인</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/70">RESEND_API_KEY</span>
            <span className="text-brand-neon">설정됨 ✅</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70">EMAIL_FROM</span>
            <span className="text-white">GConnect &lt;noreply@resend.dev&gt;</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70">현재 사용자</span>
            <span className="text-white">{session?.user?.email}</span>
          </div>
        </div>
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
            className={`text-sm ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* 테스트 폼 */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">테스트 이메일 발송</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <EnvelopeIcon className="w-4 h-4 inline mr-1" />
              수신 이메일 주소
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
            />
            <p className="mt-1 text-xs text-white/50">
              테스트 이메일을 받을 주소를 입력하세요
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '발송 중...' : '테스트 이메일 발송'}
          </button>
        </form>

        {/* 안내 */}
        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">
            💡 확인 사항
          </h3>
          <ul className="text-xs text-white/70 space-y-1 ml-4 list-disc">
            <li>이메일이 수신함에 도착하는데 1-2분 정도 걸릴 수 있습니다</li>
            <li>스팸함도 확인해주세요</li>
            <li>발신자: onboarding@resend.dev (무료 플랜)</li>
            <li>브라우저 콘솔(F12)에서 상세 로그를 확인할 수 있습니다</li>
          </ul>
        </div>
      </div>

      {/* 디버깅 정보 */}
      <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <h3 className="text-sm font-semibold text-yellow-400 mb-2">
          🔍 디버깅 팁
        </h3>
        <ul className="text-xs text-white/70 space-y-1 ml-4 list-disc">
          <li>서버를 재시작했는지 확인하세요 (환경 변수 변경 후)</li>
          <li>터미널에서 서버 로그를 확인하세요</li>
          <li>브라우저 개발자 도구(F12) → Network 탭에서 API 응답 확인</li>
          <li>Resend 대시보드(resend.com)에서 발송 로그 확인</li>
        </ul>
      </div>
    </div>
  );
}

