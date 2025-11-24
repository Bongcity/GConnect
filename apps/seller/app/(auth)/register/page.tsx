'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  BuildingStorefrontIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { registerSchema } from '@gconnect/lib/validations';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    shopName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 유효성 검사
      const validated = registerSchema.parse(formData);

      // 회원가입 API 호출
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      // 회원가입 성공 - 자동 로그인
      const result = await signIn('credentials', {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('회원가입은 완료되었으나 로그인에 실패했습니다. 로그인 페이지로 이동합니다.');
      }

      // 대시보드로 이동
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      if (err.errors) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || '회원가입 중 오류가 발생했습니다.');
      }
      setIsLoading(false);
    }
  };

  const handleNaverRegister = () => {
    signIn('naver', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="glass-card p-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">회원가입</h1>
        <p className="text-white/60">GConnect와 함께 구글 검색 노출을 시작하세요</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* 네이버로 시작하기 */}
      <button
        type="button"
        onClick={handleNaverRegister}
        className="w-full py-3 px-6 rounded-xl font-bold text-white bg-[#03C75A] hover:bg-[#02B350] transition-colors flex items-center justify-center gap-2 mb-6"
      >
        <span>네이버로 시작하기</span>
      </button>

      {/* 구분선 */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-brand-navy text-white/60">또는</span>
        </div>
      </div>

      {/* 회원가입 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이메일 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
            이메일 *
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

        {/* 이름 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
            이름 *
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="홍길동"
              required
            />
          </div>
        </div>

        {/* 상점명 */}
        <div>
          <label htmlFor="shopName" className="block text-sm font-medium text-white/80 mb-2">
            스마트스토어 상점명 *
          </label>
          <div className="relative">
            <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              id="shopName"
              type="text"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="내 상점"
              required
            />
          </div>
        </div>

        {/* 비밀번호 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
            비밀번호 *
          </label>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="대소문자, 숫자 포함 8자 이상"
              required
            />
          </div>
          <p className="mt-1 text-xs text-white/50">대문자, 소문자, 숫자를 각각 1개 이상 포함해야 합니다</p>
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
            비밀번호 확인 *
          </label>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors"
              placeholder="비밀번호 재입력"
              required
            />
          </div>
        </div>

        {/* 회원가입 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 rounded-xl font-bold text-brand-navy bg-gradient-to-r from-brand-neon to-brand-cyan hover:shadow-lg hover:shadow-brand-neon/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
        >
          {isLoading ? '처리 중...' : '회원가입'}
          {!isLoading && <ArrowRightIcon className="w-5 h-5" />}
        </button>
      </form>

      {/* 로그인 링크 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-white/60">
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="text-brand-neon hover:text-brand-cyan transition-colors font-semibold"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

