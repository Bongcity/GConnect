'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { KeyIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function NaverApiSettings() {
  const { data: _session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState({
    naverClientId: '',
    naverClientSecret: '',
    naverApiEnabled: false,
  });

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setFormData({
            naverClientId: data.naverClientId || '',
            naverClientSecret: data.naverClientSecret || '',
            naverApiEnabled: data.naverApiEnabled || false,
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
      const response = await fetch('/api/user/naver-api', {
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

      setMessage({ type: 'success', text: '네이버 API 설정이 저장되었습니다.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!formData.naverClientId || !formData.naverClientSecret) {
      setTestResult({
        success: false,
        message: 'Client ID와 Client Secret을 입력해주세요.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/user/naver-api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: formData.naverClientId,
          clientSecret: formData.naverClientSecret,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: '네이버 API 연결에 성공했습니다! ✓',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'API 연결에 실패했습니다.',
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: 'API 테스트 중 오류가 발생했습니다.',
      });
    } finally {
      setIsTesting(false);
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
        <h2 className="text-2xl font-bold text-white mb-2">네이버 커머스 API 설정</h2>
        <p className="text-white/60">
          네이버 스마트스토어 상품을 자동으로 동기화하려면 API 키가 필요합니다
        </p>
      </div>

      {/* 안내 카드 */}
      <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-sm font-semibold text-white mb-2">
          📌 네이버 커머스 API 신청 방법
        </h3>
        <ol className="text-xs text-white/70 space-y-1 ml-4 list-decimal">
          <li>네이버 커머스 API 센터 접속: <a href="https://commerce.naver.com" target="_blank" rel="noopener noreferrer" className="text-brand-neon hover:underline">commerce.naver.com</a></li>
          <li>스마트스토어 관리자 로그인</li>
          <li>&apos;상품 관리&apos; → &apos;API 연동 설정&apos; 메뉴</li>
          <li>API 이용 신청 및 승인 대기</li>
          <li>승인 후 Client ID와 Client Secret 발급</li>
        </ol>
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

      {/* 테스트 결과 */}
      {testResult && (
        <div
          className={`mb-6 p-4 rounded-xl ${
            testResult.success
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-400" />
            )}
            <p
              className={`text-sm ${
                testResult.success ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {testResult.message}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client ID */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Client ID *
          </label>
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={formData.naverClientId}
              onChange={(e) =>
                setFormData({ ...formData, naverClientId: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors font-mono text-sm"
              placeholder="예: ABCDEF1234567890"
            />
          </div>
        </div>

        {/* Client Secret */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Client Secret *
          </label>
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="password"
              value={formData.naverClientSecret}
              onChange={(e) =>
                setFormData({ ...formData, naverClientSecret: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors font-mono text-sm"
              placeholder="••••••••••••••••"
            />
          </div>
          <p className="mt-1 text-xs text-white/50">
            Client Secret은 암호화되어 안전하게 저장됩니다
          </p>
        </div>

        {/* API 활성화 */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="naverApiEnabled"
            checked={formData.naverApiEnabled}
            onChange={(e) =>
              setFormData({ ...formData, naverApiEnabled: e.target.checked })
            }
            className="w-5 h-5 rounded"
          />
          <label htmlFor="naverApiEnabled" className="text-white">
            네이버 API 자동 동기화 활성화
          </label>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || !formData.naverClientId || !formData.naverClientSecret}
            className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? '테스트 중...' : 'API 연결 테스트'}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>

      {/* 주의사항 */}
      <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <h3 className="text-sm font-semibold text-yellow-400 mb-2">⚠️ 주의사항</h3>
        <ul className="text-xs text-white/70 space-y-1 ml-4 list-disc">
          <li>API 키는 절대 타인과 공유하지 마세요</li>
          <li>API 호출 한도를 초과하면 일시적으로 차단될 수 있습니다</li>
          <li>네이버 스마트스토어 정책에 따라 API 사용이 제한될 수 있습니다</li>
          <li>상품 동기화는 하루 최대 1회 권장됩니다</li>
        </ul>
      </div>
    </div>
  );
}

