'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SyncLog {
  id: string;
  syncType: string;
  status: string;
  itemsTotal: number;
  itemsSynced: number;
  itemsFailed: number;
  errorLog: string | null;
  createdAt: string;
}

export default function SyncLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/sync-logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'FAILED':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'PARTIAL':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-white/40" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="text-green-400">성공</span>;
      case 'FAILED':
        return <span className="text-red-400">실패</span>;
      case 'PARTIAL':
        return <span className="text-yellow-400">부분 성공</span>;
      default:
        return <span className="text-white/60">알 수 없음</span>;
    }
  };

  const getSyncTypeText = (syncType: string) => {
    switch (syncType) {
      case 'AUTO_SYNC':
        return '자동 동기화';
      case 'MANUAL_SYNC':
        return '수동 동기화';
      case 'PRODUCT_SYNC':
        return '상품 동기화';
      default:
        return syncType;
    }
  };

  if (isLoading) {
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
        <h1 className="text-4xl font-bold text-white mb-2">동기화 로그</h1>
        <p className="text-white/60">자동 및 수동 동기화 실행 기록을 확인하세요</p>
      </div>

      {/* 로그가 없을 때 */}
      {logs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ClockIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            아직 동기화 기록이 없습니다
          </h3>
          <p className="text-white/60">
            상품 관리 페이지에서 "동기화" 버튼을 눌러 시작하거나,
            <br />
            설정에서 자동 동기화를 활성화하세요.
          </p>
        </div>
      ) : (
        /* 로그 목록 */
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="glass-card p-6 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {getSyncTypeText(log.syncType)}
                    </h3>
                    <p className="text-sm text-white/60">
                      {format(new Date(log.createdAt), 'yyyy년 M월 d일 HH:mm:ss', {
                        locale: ko,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{getStatusText(log.status)}</div>
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-white/50 mb-1">총 항목</p>
                  <p className="text-xl font-bold text-white">{log.itemsTotal}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">성공</p>
                  <p className="text-xl font-bold text-green-400">{log.itemsSynced}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">실패</p>
                  <p className="text-xl font-bold text-red-400">{log.itemsFailed}</p>
                </div>
              </div>

              {/* 오류 로그 */}
              {log.errorLog && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 font-mono">{log.errorLog}</p>
                </div>
              )}

              {/* 진행 바 */}
              {log.itemsTotal > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/60 mb-2">
                    <span>
                      성공률: {((log.itemsSynced / log.itemsTotal) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-neon to-brand-cyan h-full transition-all"
                      style={{
                        width: `${(log.itemsSynced / log.itemsTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

