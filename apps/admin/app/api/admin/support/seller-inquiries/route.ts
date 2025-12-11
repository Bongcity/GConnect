import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * 셀러 문의 목록 조회 (관리자용)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const category = searchParams.get('category') || 'ALL';

    const where: any = {};

    // 상태 필터
    if (status !== 'ALL') {
      where.status = status;
    }

    // 카테고리 필터
    if (category !== 'ALL') {
      where.category = category;
    }

    // 검색
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { userName: { contains: search } },
        { userEmail: { contains: search } },
        { userShopName: { contains: search } },
      ];
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('Seller inquiries list error:', error);
    return NextResponse.json(
      { error: '문의 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

