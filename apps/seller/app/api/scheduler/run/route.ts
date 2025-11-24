import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { executeSyncJob } from '@/lib/scheduler';

// 수동 동기화 실행
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 백그라운드에서 동기화 실행
    // await를 사용하지 않아 즉시 응답 반환
    executeSyncJob(session.user.id).catch((error) => {
      console.error('Manual sync error:', error);
    });

    return NextResponse.json({
      ok: true,
      message: '동기화 작업이 시작되었습니다.',
    });
  } catch (error) {
    console.error('Run sync error:', error);
    return NextResponse.json(
      { error: '동기화 실행 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

