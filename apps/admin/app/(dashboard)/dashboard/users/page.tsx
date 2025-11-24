'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string | null;
  shopName: string | null;
  shopStatus: string;
  createdAt: string;
  _count: {
    products: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('사용자 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    if (!confirm(`사용자 상태를 ${status}로 변경하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopStatus: status }),
      });

      if (res.ok) {
        alert('상태가 변경되었습니다.');
        fetchUsers();
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      SUSPENDED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles] || styles.PENDING
        }`}
      >
        {status}
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
        <h1 className="text-3xl font-bold mb-2">사용자 관리</h1>
        <p className="text-white/60">판매자 계정 및 상태 관리</p>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        {['ALL', 'ACTIVE', 'PENDING'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === status
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {status === 'ALL' ? '전체' : status}
          </button>
        ))}
      </div>

      {/* 사용자 목록 */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  이메일
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  이름
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  상점명
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  상품 수
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  가입일
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-white/60"
                  >
                    사용자가 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {user.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.shopName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user._count.products}개
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.shopStatus)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      {format(new Date(user.createdAt), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.shopStatus}
                        onChange={(e) =>
                          updateUserStatus(user.id, e.target.value)
                        }
                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-400/50"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PENDING">PENDING</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">전체 사용자</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">활성 사용자</p>
          <p className="text-3xl font-bold">
            {users.filter((u) => u.shopStatus === 'ACTIVE').length}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">대기 중</p>
          <p className="text-3xl font-bold">
            {users.filter((u) => u.shopStatus === 'PENDING').length}
          </p>
        </div>
      </div>
    </div>
  );
}

