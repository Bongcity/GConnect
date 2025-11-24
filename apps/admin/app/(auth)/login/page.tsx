'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-center mb-6">
        <ShieldCheckIcon className="w-12 h-12 text-red-400" />
      </div>

      <h1 className="text-2xl font-bold text-center mb-2">관리자 로그인</h1>
      <p className="text-white/60 text-center mb-8 text-sm">
        GConnect 플랫폼 관리자 전용
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-400/50 focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all"
            placeholder="admin@gconnect.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-400/50 focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '로그인 중...' : '관리자 로그인'}
        </button>
      </form>

      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-white/60 text-center">
          🔐 관리자 전용 페이지입니다
        </p>
        <p className="text-xs text-white/40 text-center mt-1">
          기본 계정: admin@gconnect.com / admin1234!@
        </p>
      </div>
    </div>
  );
}

