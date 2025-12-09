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
      // 마스킹된 값이면 제외 (기존 값 유지)
      const dataToSend = {
        naverClientId: formData.naverClientId,
        naverClientSecret: formData.naverClientSecret.includes('•') 
          ? undefined 
          : formData.naverClientSecret,
        naverApiEnabled: formData.naverApiEnabled,
      };

      const response = await fetch('/api/user/naver-api', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
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
      // 마스킹된 시크릿이면 빈 값으로 보내기 (서버에서 DB 값 사용)
      const secretToSend = formData.naverClientSecret.includes('•') 
        ? '' 
        : formData.naverClientSecret.trim();
      
      const response = await fetch('/api/user/naver-api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: formData.naverClientId.trim(),
          clientSecret: secretToSend,
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
          📌 네이버 커머스 API 신청 및 설정 방법
        </h3>
        <ol className="text-xs text-white/70 space-y-2 ml-4 list-decimal">
          <li>
            <strong className="text-white">커머스 API 센터 접속</strong>
            <br />
            <a href="https://apicenter.commerce.naver.com" target="_blank" rel="noopener noreferrer" className="text-brand-neon hover:underline">
              apicenter.commerce.naver.com
            </a> 또는 스마트스토어센터 &gt; 스토어관리 &gt; API 관리
          </li>
          <li>
            <strong className="text-white">애플리케이션 생성</strong>
            <br />
            &apos;내 스토어 애플리케이션 선택&apos; 메뉴에서 신규 생성
          </li>
          <li>
            <strong className="text-white">API 타입 선택</strong>
            <br />
            &apos;상품&apos; API 선택 (상품 조회 및 관리를 위해 필요)
          </li>
          <li>
            <strong className="text-white">API 키 복사</strong>
            <br />
            &apos;애플리케이션 ID&apos;와 &apos;애플리케이션 시크릿&apos; 복사하여 아래에 입력
          </li>
          <li>
            <strong className="text-white">⚠️ API호출 IP 등록 (중요)</strong>
            <br />
            커머스 API 센터에서 서버 IP 주소를 등록해야 합니다.
            <br />
            미등록 시 API 호출이 거부됩니다.
          </li>
        </ol>
      </div>

      {/* 추가 안내 - 문제 해결 */}
      <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <h3 className="text-sm font-semibold text-white mb-2">
          ⚠️ API 연결이 안 될 때 체크리스트
        </h3>
        <ul className="text-xs text-white/70 space-y-1 ml-4 list-disc">
          <li>커머스 API 센터에서 애플리케이션이 &apos;승인됨&apos; 상태인지 확인</li>
          <li>API호출 IP가 올바르게 등록되어 있는지 확인</li>
          <li>애플리케이션 ID와 시크릿이 정확한지 확인 (공백 제거)</li>
          <li>&apos;상품&apos; API가 활성화되어 있는지 확인</li>
          <li>스마트스토어 판매자 계정 상태가 정상인지 확인</li>
        </ul>
        <div className="mt-3 text-xs">
          <a 
            href="https://help.sell.smartstore.naver.com/faq/search.help?categoryNo=0&searchKeyword=api" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-brand-neon hover:underline"
          >
            📚 네이버 스마트스토어 API FAQ 보기 →
          </a>
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
        {/* Application ID */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            애플리케이션 ID *
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
              placeholder="예: 4KbqV13RTCuyfV95WDebVs"
            />
          </div>
          <p className="mt-1 text-xs text-white/50">
            네이버 API 센터에서 발급받은 애플리케이션 ID를 입력하세요
          </p>
        </div>

        {/* Application Secret */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            애플리케이션 시크릿 *
          </label>
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="password"
              value={formData.naverClientSecret}
              onFocus={(e) => {
                // 마스킹된 값이면 자동으로 지움
                if (formData.naverClientSecret.includes('•')) {
                  setFormData({ ...formData, naverClientSecret: '' });
                }
              }}
              onChange={(e) =>
                setFormData({ ...formData, naverClientSecret: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-neon/50 transition-colors font-mono text-sm"
              placeholder={formData.naverClientSecret.includes('•') 
                ? "기존 값 유지 (변경하려면 새 시크릿 입력)" 
                : "$2a$ 로 시작하는 시크릿 키"}
            />
          </div>
          <p className="mt-1 text-xs text-white/50">
            {formData.naverClientSecret.includes('•') 
              ? "기존 시크릿이 저장되어 있습니다. 변경하려면 새 값을 입력하세요."
              : "애플리케이션 시크릿은 암호화되어 안전하게 저장됩니다"}
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

