import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 모든 동기화 스케줄 조회 (사용자 정보 포함)
    const schedules = await prisma.syncSchedule.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            shopName: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      schedules,
    });
  } catch (error) {
    console.error('Failed to fetch sync schedules:', error);
    return NextResponse.json(
      { error: '동기화 스케줄을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

