'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface SyncLog {
  id: string;
  syncType: string;
  status: string;
  itemsTotal: number;
  itemsSynced: number;
  itemsFailed: number;
  errorLog: string | null;
  createdAt: string;
  user: {
    email: string;
    shopName: string | null;
  };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/admin/logs?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('로그 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'SUCCESS' ? (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
        성공
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
        실패
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">시스템 로그</h1>
        <p className="text-white/60">동기화 및 시스템 활동 로그</p>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        {['ALL', 'SUCCESS', 'FAILED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === status
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {status === 'ALL'
              ? '전체'
              : status === 'SUCCESS'
              ? '성공'
              : '실패'}
          </button>
        ))}
      </div>

      {/* 로그 목록 */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  시간
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  사용자
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  유형
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  상태
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  전체
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  성공
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  실패
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  에러
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-white/60"
                  >
                    로그가 없습니다.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-white/60">
                      {format(
                        new Date(log.createdAt),
                        'yyyy-MM-dd HH:mm:ss'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.user.shopName || log.user.email}
                    </td>
                    <td className="px-6 py-4 text-sm">{log.syncType}</td>
                    <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      {log.itemsTotal}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-green-400">
                      {log.itemsSynced}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-red-400">
                      {log.itemsFailed}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-400/80">
                      {log.errorLog || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-6 mt-6">
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">전체 로그</p>
          <p className="text-3xl font-bold">{logs.length}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">성공</p>
          <p className="text-3xl font-bold text-green-400">
            {logs.filter((l) => l.status === 'SUCCESS').length}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">실패</p>
          <p className="text-3xl font-bold text-red-400">
            {logs.filter((l) => l.status === 'FAILED').length}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">성공률</p>
          <p className="text-3xl font-bold">
            {logs.length > 0
              ? Math.round(
                  (logs.filter((l) => l.status === 'SUCCESS').length /
                    logs.length) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>
    </div>
  );
}

