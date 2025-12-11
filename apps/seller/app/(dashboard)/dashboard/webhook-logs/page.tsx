'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  BoltIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface WebhookLog {
  id: string;
  webhookId: string;
  webhookName: string;
  webhookUrl: string;
  webhookType: string;
  status: 'SUCCESS' | 'FAILED';
  responseStatus: number | null;
  responseTime: number;
  requestUrl: string;
  createdAt: string;
}

interface WebhookLogDetail extends WebhookLog {
  requestMethod: string;
  requestBody: string;
  requestHeaders: string;
  responseBody: string | null;
  errorMessage: string | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedLog, setSelectedLog] = useState<WebhookLogDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [filterStatus, pagination.page]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (filterStatus !== 'ALL') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/webhook-logs?${params}`);
      
      if (response.status === 403) {
        alert('웹훅 로그는 Enterprise 플랜 사용자만 이용할 수 있습니다.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch webhook logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogDetail = async (logId: string) => {
    setIsLoadingDetail(true);
    try {
      const response = await fetch(`/api/webhook-logs/${logId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedLog(data.log);
        setShowDetailModal(true);
      } else {
        alert('로그 상세 정보를 불러오지 못했습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch log detail:', error);
      alert('로그 상세 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'SUCCESS' ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-400 border border-green-500/20">
        <CheckCircleIcon className="w-3 h-3" />
        성공
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircleIcon className="w-3 h-3" />
        실패
      </span>
    );
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BoltIcon className="w-8 h-8 text-brand-cyan" />
          <h1 className="text-4xl font-bold text-white">웹훅 로그</h1>
          <span className="px-2 py-1 text-xs font-bold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
            ENTERPRISE
          </span>
        </div>
        <p className="text-white/60">웹훅 실행 이력을 확인하세요</p>
      </div>

      {/* 필터 */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['ALL', 'SUCCESS', 'FAILED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-brand-neon text-brand-navy'
                    : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                {status === 'ALL' ? '전체' : status === 'SUCCESS' ? '성공' : '실패'}
              </button>
            ))}
          </div>

          <div className="text-sm text-white/60">
            총 {pagination.total}개의 로그
          </div>
        </div>
      </div>

      {/* 로그 테이블 */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-4 text-left text-sm font-semibold text-white w-[180px]">
                  웹훅명
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white w-[100px]">
                  타입
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white w-[140px]">
                  실행시간
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white w-[80px]">
                  상태
                </th>
                <th className="px-4 py-4 text-right text-sm font-semibold text-white w-[100px]">
                  응답시간
                </th>
                <th className="px-4 py-4 text-right text-sm font-semibold text-white w-[100px]">
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/60">
                    로그가 없습니다.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white font-medium truncate">{log.webhookName}</p>
                        <p className="text-xs text-white/50 truncate">{log.webhookUrl}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/70">
                        {log.webhookType}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-white/70 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(log.status)}</td>
                    <td className="px-4 py-4 text-sm text-right text-white">
                      {log.responseTime}ms
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => fetchLogDetail(log.id)}
                        disabled={isLoadingDetail}
                        className="btn-secondary text-sm"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-center gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded bg-white/5 text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
            >
              이전
            </button>
            <span className="text-white/60 text-sm">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 rounded bg-white/5 text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">웹훅 로그 상세</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white/60 hover:text-white"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* 상태 */}
            <div className="mb-6">
              {selectedLog.status === 'SUCCESS' ? (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-lg font-semibold text-green-400">성공</p>
                    <p className="text-sm text-white/70">웹훅이 정상적으로 전송되었습니다</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/20 border border-red-500/30">
                  <XCircleIcon className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="text-lg font-semibold text-red-400">실패</p>
                    <p className="text-sm text-white/70">웹훅 전송에 실패했습니다</p>
                  </div>
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60 mb-1">웹훅명</p>
                  <p className="text-white font-semibold">{selectedLog.webhookName}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60 mb-1">타입</p>
                  <p className="text-white font-semibold">{selectedLog.webhookType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60 mb-1">응답 상태</p>
                  <p className="text-white font-semibold">
                    {selectedLog.responseStatus || 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60 mb-1">응답 시간</p>
                  <p className="text-white font-semibold">{selectedLog.responseTime}ms</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 mb-2">요청 URL</p>
                <code className="text-sm text-brand-cyan break-all">
                  {selectedLog.requestUrl}
                </code>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 mb-1">실행 시간</p>
                <p className="text-sm text-white">
                  {new Date(selectedLog.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>

            {/* 에러 메시지 */}
            {selectedLog.errorMessage && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
                <p className="text-sm text-red-400 mb-2">에러 메시지</p>
                <pre className="text-sm text-white/80 whitespace-pre-wrap break-words">
                  {selectedLog.errorMessage}
                </pre>
              </div>
            )}

            {/* 요청 정보 */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
              <p className="text-sm text-white/60 mb-2">요청 본문</p>
              <pre className="text-sm text-white/80 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                {selectedLog.requestBody}
              </pre>
            </div>

            {/* 응답 정보 */}
            {selectedLog.responseBody && (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
                <p className="text-sm text-white/60 mb-2">응답 본문</p>
                <pre className="text-sm text-white/80 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                  {selectedLog.responseBody}
                </pre>
              </div>
            )}

            {/* 닫기 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn-primary"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 안내 */}
      <div className="mt-8 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">💡 웹훅 로그 안내</h3>
        <ul className="text-xs text-white/70 space-y-1 ml-4 list-disc">
          <li>자동 동기화가 실행될 때마다 설정된 웹훅이 자동으로 호출됩니다</li>
          <li>성공/실패 여부, 응답 시간, 응답 내용을 확인할 수 있습니다</li>
          <li>로그는 최대 90일간 보관됩니다</li>
          <li>웹훅 설정은 관리자에게 문의해주세요</li>
        </ul>
      </div>
    </div>
  );
}

