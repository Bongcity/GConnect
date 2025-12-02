import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="relative w-48 h-12 sm:w-64 sm:h-16">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-brand-neon to-brand-cyan"
              style={{
                WebkitMaskImage: 'url(/GConnect-logo.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/GConnect-logo.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            />
          </div>
          <span className="text-4xl sm:text-5xl font-bold gradient-text">Seller</span>
        </div>
        <p className="text-xl text-white/70 mb-12">
          네이버 스마트스토어를 구글 검색에 자동으로 연결하는 플랫폼
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            <span>로그인</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <Link
            href="/register"
            className="btn-neon inline-flex items-center justify-center gap-2"
          >
            <span>무료로 시작하기</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}

