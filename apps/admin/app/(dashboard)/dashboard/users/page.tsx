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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
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
    const statusLabels = {
      ACTIVE: '활성',
      PENDING: '대기',
      SUSPENDED: '정지',
    };
    
    if (!confirm(`사용자 상태를 ${statusLabels[status as keyof typeof statusLabels]}로 변경하시겠습니까?`)) return;

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

  const getStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: '활성',
      PENDING: '대기',
      SUSPENDED: '정지',
    };
    return labels[status as keyof typeof labels] || status;
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
        {getStatusLabel(status)}
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

  // 페이징 계산
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">사용자 관리</h1>
        <p className="text-white/60">판매자 계정 및 상태 관리</p>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'ALL', label: '전체' },
          { value: 'ACTIVE', label: '활성' },
          { value: 'PENDING', label: '대기' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value as any)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === item.value
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {item.label}
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
                currentUsers.map((user) => (
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
                        className="px-3 py-2 rounded-lg bg-[#1a1f2e] border border-white/20 text-white text-sm focus:outline-none focus:border-red-400/50 hover:bg-[#252b3d] transition-colors cursor-pointer"
                        style={{
                          backgroundImage: 'none',
                          appearance: 'none',
                          paddingRight: '2rem',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.6)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1.25rem',
                        }}
                      >
                        <option value="ACTIVE" className="bg-[#1a1f2e] text-white">활성</option>
                        <option value="PENDING" className="bg-[#1a1f2e] text-white">대기</option>
                        <option value="SUSPENDED" className="bg-[#1a1f2e] text-white">정지</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이징 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            이전
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // 현재 페이지 주변만 표시
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 3 ||
                page === currentPage + 3
              ) {
                return (
                  <span key={page} className="w-10 h-10 flex items-center justify-center text-white/40">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            다음
          </button>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-6 mt-6">
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">전체 회원</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">활성 회원</p>
          <p className="text-3xl font-bold">
            {users.filter((u) => u.shopStatus === 'ACTIVE').length}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">대기 회원</p>
          <p className="text-3xl font-bold">
            {users.filter((u) => u.shopStatus === 'PENDING').length}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm mb-2">정지 회원</p>
          <p className="text-3xl font-bold">
            {users.filter((u) => u.shopStatus === 'SUSPENDED').length}
          </p>
        </div>
      </div>
    </div>
  );
}

