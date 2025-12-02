/**
 * 관리자 알림 시스템
 * AdminNotification 테이블에 알림을 생성합니다.
 */

import { PrismaClient } from '@prisma/client';

// Prisma Client 직접 생성 (DDRo import 회피)
const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export interface SyncErrorNotificationData {
  userId: string;
  userName?: string;
  userEmail?: string;
  errorMessage: string;
  errorType?: string;
  syncLogId: string;
  retryCount?: number;
}

/**
 * 동기화 실패 시 관리자 알림 생성
 */
export async function createSyncErrorNotification(
  data: SyncErrorNotificationData
): Promise<void> {
  try {
    const { userId, userName, userEmail, errorMessage, errorType, syncLogId, retryCount } = data;
    
    const userInfo = userName || userEmail || userId;
    const retryInfo = retryCount ? ` (${retryCount}회 재시도 후 실패)` : '';
    
    await prisma.adminNotification.create({
      data: {
        type: 'SYNC_ERROR',
        title: '상품 동기화 실패',
        message: `사용자 ${userInfo}의 상품 동기화가 실패했습니다${retryInfo}: ${errorMessage}`,
        severity: 'ERROR',
        link: `/admin/sync-logs/${syncLogId}`,
        metadata: JSON.stringify({
          userId,
          syncLogId,
          errorType,
          retryCount,
          timestamp: new Date().toISOString(),
        }),
      },
    });
    
    console.log(`[Notification] 동기화 실패 알림 생성: ${userInfo}`);
  } catch (error) {
    console.error('[Notification] 알림 생성 실패:', error);
    // 알림 생성 실패는 전체 프로세스를 중단하지 않음
  }
}

/**
 * 동기화 성공 시 관리자 알림 생성 (선택적)
 */
export async function createSyncSuccessNotification(
  userId: string,
  syncedCount: number,
  syncLogId: string
): Promise<void> {
  try {
    await prisma.adminNotification.create({
      data: {
        type: 'SYNC_SUCCESS',
        title: '상품 동기화 성공',
        message: `사용자 ${userId}의 상품 ${syncedCount}개가 성공적으로 동기화되었습니다.`,
        severity: 'INFO',
        link: `/admin/sync-logs/${syncLogId}`,
        metadata: JSON.stringify({
          userId,
          syncLogId,
          syncedCount,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (error) {
    console.error('[Notification] 알림 생성 실패:', error);
  }
}

/**
 * 스케줄러 시작/중지 알림
 */
export async function createSchedulerNotification(
  action: 'START' | 'STOP' | 'ERROR',
  message: string
): Promise<void> {
  try {
    const severityMap = {
      START: 'INFO',
      STOP: 'WARNING',
      ERROR: 'ERROR',
    };
    
    await prisma.adminNotification.create({
      data: {
        type: 'SCHEDULER',
        title: `스케줄러 ${action === 'START' ? '시작' : action === 'STOP' ? '중지' : '오류'}`,
        message,
        severity: severityMap[action] as 'INFO' | 'WARNING' | 'ERROR',
        metadata: JSON.stringify({
          action,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (error) {
    console.error('[Notification] 알림 생성 실패:', error);
  }
}

