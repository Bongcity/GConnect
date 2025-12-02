import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * GET: 현재 사용자의 동기화 스케줄 설정 조회
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 스케줄 설정 조회
    let schedule = await prisma.syncSchedule.findUnique({
      where: { userId: session.user.id },
    });

    // 스케줄이 없으면 기본값으로 생성
    if (!schedule) {
      schedule = await prisma.syncSchedule.create({
        data: {
          userId: session.user.id,
          isEnabled: false,
          cronExpression: '0 */4 * * *', // 매 4시간마다
          timezone: 'Asia/Seoul',
          syncProducts: true,
          updateFeed: true,
          notifyOnSuccess: false,
          notifyOnError: true,
        },
      });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Get sync schedule error:', error);
    return NextResponse.json(
      { error: '스케줄 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST/PUT: 동기화 스케줄 설정 생성/수정
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      isEnabled,
      cronExpression,
      timezone,
      syncProducts,
      updateFeed,
      notifyOnSuccess,
      notifyOnError,
      notifyEmail,
    } = body;

    // 크론 표현식 유효성 검사 (간단한 검증)
    if (cronExpression && typeof cronExpression === 'string') {
      const parts = cronExpression.split(' ');
      if (parts.length !== 5) {
        return NextResponse.json(
          { error: '잘못된 크론 표현식입니다. (예: 0 */4 * * *)' },
          { status: 400 }
        );
      }
    }

    // 다음 실행 시간 계산 (간단한 구현)
    const nextRun = isEnabled ? calculateNextRun(cronExpression || '0 */4 * * *') : null;

    // Upsert 스케줄 설정
    const schedule = await prisma.syncSchedule.upsert({
      where: { userId: session.user.id },
      update: {
        isEnabled: isEnabled ?? undefined,
        cronExpression: cronExpression ?? undefined,
        timezone: timezone ?? undefined,
        syncProducts: syncProducts ?? undefined,
        updateFeed: updateFeed ?? undefined,
        notifyOnSuccess: notifyOnSuccess ?? undefined,
        notifyOnError: notifyOnError ?? undefined,
        notifyEmail: notifyEmail ?? undefined,
        nextRun,
      },
      create: {
        userId: session.user.id,
        isEnabled: isEnabled ?? false,
        cronExpression: cronExpression || '0 */4 * * *',
        timezone: timezone || 'Asia/Seoul',
        syncProducts: syncProducts ?? true,
        updateFeed: updateFeed ?? true,
        notifyOnSuccess: notifyOnSuccess ?? false,
        notifyOnError: notifyOnError ?? true,
        notifyEmail,
        nextRun,
      },
    });

    return NextResponse.json({
      ok: true,
      message: '스케줄 설정이 저장되었습니다.',
      schedule,
    });
  } catch (error) {
    console.error('Update sync schedule error:', error);
    return NextResponse.json(
      { error: '스케줄 설정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 동기화 스케줄 비활성화
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 스케줄 비활성화 (삭제하지 않고 isEnabled만 false로)
    const schedule = await prisma.syncSchedule.update({
      where: { userId: session.user.id },
      data: {
        isEnabled: false,
        nextRun: null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: '자동 동기화가 비활성화되었습니다.',
      schedule,
    });
  } catch (error) {
    console.error('Delete sync schedule error:', error);
    return NextResponse.json(
      { error: '스케줄 비활성화 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 다음 실행 시간 계산 (간단한 구현)
 * 실제로는 node-cron이나 cron-parser 라이브러리 사용 권장
 */
function calculateNextRun(cronExpression: string): Date {
  const now = new Date();
  
  // 크론 표현식 파싱 (간단한 버전)
  const parts = cronExpression.split(' ');
  const [minute, hour] = parts;
  
  // */4 형태 처리
  if (hour.startsWith('*/')) {
    const interval = parseInt(hour.substring(2));
    const nextHour = Math.ceil(now.getHours() / interval) * interval;
    const nextRun = new Date(now);
    nextRun.setHours(nextHour, parseInt(minute) || 0, 0, 0);
    
    // 다음 날로 넘어가는 경우
    if (nextRun <= now) {
      nextRun.setHours(nextRun.getHours() + interval);
    }
    
    return nextRun;
  }
  
  // 기본: 1시간 후
  const nextRun = new Date(now.getTime() + 60 * 60 * 1000);
  return nextRun;
}

