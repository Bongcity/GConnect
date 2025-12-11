import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * 사용자 본인의 문의 내역 조회
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

    const userId = session.user.id;

    // 본인의 문의만 조회
    const inquiries = await prisma.inquiry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ inquiries });

  } catch (error) {
    console.error('Failed to fetch user inquiries:', error);
    return NextResponse.json(
      { error: '문의 내역을 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}

