import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { registerCronJob, stopCronJob } from '@/lib/scheduler';

// 스케줄 설정 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const schedule = await prisma.syncSchedule.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      ok: true,
      schedule: schedule || null,
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json(
      { error: '스케줄 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 스케줄 설정 저장/수정
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await req.json();
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

    // 기존 스케줄 확인
    const existingSchedule = await prisma.syncSchedule.findUnique({
      where: { userId: session.user.id },
    });

    let schedule;

    if (existingSchedule) {
      // 수정
      schedule = await prisma.syncSchedule.update({
        where: { id: existingSchedule.id },
        data: {
          isEnabled: isEnabled !== undefined ? isEnabled : existingSchedule.isEnabled,
          cronExpression: cronExpression || existingSchedule.cronExpression,
          timezone: timezone || existingSchedule.timezone,
          syncProducts: syncProducts !== undefined ? syncProducts : existingSchedule.syncProducts,
          updateFeed: updateFeed !== undefined ? updateFeed : existingSchedule.updateFeed,
          notifyOnSuccess: notifyOnSuccess !== undefined ? notifyOnSuccess : existingSchedule.notifyOnSuccess,
          notifyOnError: notifyOnError !== undefined ? notifyOnError : existingSchedule.notifyOnError,
          notifyEmail: notifyEmail !== undefined ? notifyEmail : existingSchedule.notifyEmail,
        },
        include: {
          user: {
            select: {
              naverClientId: true,
              naverClientSecret: true,
              naverApiEnabled: true,
            },
          },
        },
      });
    } else {
      // 생성
      schedule = await prisma.syncSchedule.create({
        data: {
          userId: session.user.id,
          isEnabled: isEnabled || false,
          cronExpression: cronExpression || '0 2 * * *',
          timezone: timezone || 'Asia/Seoul',
          syncProducts: syncProducts !== undefined ? syncProducts : true,
          updateFeed: updateFeed !== undefined ? updateFeed : true,
          notifyOnSuccess: notifyOnSuccess || false,
          notifyOnError: notifyOnError !== undefined ? notifyOnError : true,
          notifyEmail: notifyEmail || null,
        },
        include: {
          user: {
            select: {
              naverClientId: true,
              naverClientSecret: true,
              naverApiEnabled: true,
            },
          },
        },
      });
    }

    // 크론 작업 재등록
    if (schedule.isEnabled) {
      await registerCronJob(schedule);
    } else {
      stopCronJob(session.user.id);
    }

    return NextResponse.json({
      ok: true,
      schedule,
    });
  } catch (error) {
    console.error('Save schedule error:', error);
    return NextResponse.json(
      { error: '스케줄 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 스케줄 삭제
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 크론 작업 중지
    stopCronJob(session.user.id);

    // 스케줄 삭제
    await prisma.syncSchedule.delete({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: '스케줄 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

