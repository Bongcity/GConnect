'use client';

import Link from 'next/link';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-neon to-brand-cyan animate-pulse">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-white">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-400">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            이전 페이지
          </button>
          
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-brand-neon to-brand-cyan text-white font-semibold hover:shadow-lg hover:shadow-brand-neon/50 transition-all"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            대시보드로
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 text-gray-600 text-sm">
          <p>문제가 지속되면 관리자에게 문의해주세요.</p>
        </div>
      </div>
    </div>
  );
}

