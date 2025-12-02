'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterRead, setFilterRead] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [filterType, filterRead]);

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.append('type', filterType);
      if (filterRead !== null) params.append('isRead', filterRead);

      const res = await fetch(`/api/admin/notifications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('이 알림을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    await Promise.all(unreadIds.map((id) => markAsRead(id)));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'ERROR':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'WARNING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'INFO':
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    // 타입별 아이콘 매핑
    return <BellIcon className="w-5 h-5" />;
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">알림 센터</h1>
          <p className="text-white/60">시스템 알림 및 이벤트 관리</p>
        </div>
        <button onClick={markAllAsRead} className="btn-secondary">
          모두 읽음 처리
        </button>
      </div>

      {/* 필터 */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-white/60" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#1a1f2e] border border-white/20 text-white focus:outline-none"
          >
            <option value="ALL">전체 유형</option>
            <option value="SYSTEM">시스템</option>
            <option value="SYNC">동기화</option>
            <option value="PAYMENT">결제</option>
            <option value="PLAN">플랜</option>
            <option value="INQUIRY">문의</option>
          </select>

          <select
            value={filterRead || ''}
            onChange={(e) => setFilterRead(e.target.value || null)}
            className="px-4 py-2 rounded-xl bg-[#1a1f2e] border border-white/20 text-white focus:outline-none"
          >
            <option value="">전체 상태</option>
            <option value="false">읽지 않음</option>
            <option value="true">읽음</option>
          </select>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BellIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">알림이 없습니다.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`glass-card p-6 ${
                !notification.isRead ? 'border-l-4 border-red-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                        notification.severity
                      )}`}
                    >
                      {notification.type}
                    </span>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {notification.title}
                  </h3>
                  <p className="text-white/70 mb-3">{notification.message}</p>
                  <p className="text-xs text-white/40">
                    {format(new Date(notification.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="btn-secondary text-sm"
                      title="읽음 처리"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="btn-secondary text-sm text-red-400 hover:bg-red-500/20"
                    title="삭제"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

