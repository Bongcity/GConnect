'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { loginSchema } from '@gconnect/lib/validations';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 유효성 검사
      const validated = loginSchema.parse(formData);

      // NextAuth 로그인
      const result = await signIn('credentials', {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // 로그인 성공 - 대시보드로 이동
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      if (err.errors) {
        setError(err.errors[0].message);
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
      setIsLoading(false);
    }
  };

  const handleNaverLogin = () => {
    signIn('naver', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="glass-card p-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">로그인</h1>
        <p className="text-white/60">GConnect Seller에 오신 것을 환영합니다</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* 로그인 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {/* 이메일 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
            이메일
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="example@email.com"
              required
            />
          </div>
        </div>

        {/* 비밀번호 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
            비밀번호
          </label>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 rounded-xl font-bold text-brand-navy bg-gradient-to-r from-brand-neon to-brand-cyan hover:shadow-lg hover:shadow-brand-neon/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? '로그인 중...' : '로그인'}
          {!isLoading && <ArrowRightIcon className="w-5 h-5" />}
        </button>
      </form>

      {/* 구분선 */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-brand-navy text-white/60">또는</span>
        </div>
      </div>

      {/* 네이버 로그인 */}
      <button
        type="button"
        onClick={handleNaverLogin}
        className="w-full py-3 px-6 rounded-xl font-bold text-white bg-[#03C75A] hover:bg-[#02B350] transition-colors flex items-center justify-center gap-2"
      >
        <span>네이버로 로그인</span>
      </button>

      {/* 회원가입 링크 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-white/60">
          아직 계정이 없으신가요?{' '}
          <Link
            href="/register"
            className="text-brand-neon hover:text-brand-cyan transition-colors font-semibold"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

