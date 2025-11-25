'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러를 로깅 서비스로 전송할 수 있습니다
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-white">
            앗! 오류가 발생했습니다
          </h2>
          <p className="text-gray-400">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          
          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
              <p className="text-xs text-red-400 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-brand-neon to-brand-cyan text-white font-semibold hover:shadow-lg hover:shadow-brand-neon/50 transition-all"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          다시 시도
        </button>

        {/* Help Text */}
        <div className="mt-8 text-gray-600 text-sm">
          <p>문제가 계속되면 페이지를 새로고침하거나</p>
          <p>관리자에게 문의해주세요.</p>
        </div>
      </div>
    </div>
  );
}

