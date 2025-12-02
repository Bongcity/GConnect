import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const planIntent = searchParams.get('planIntent') || 'ALL';
    const inquiryType = searchParams.get('inquiryType') || 'ALL';

    const where: any = {};

    if (status === 'HANDLED') {
      where.isHandled = true;
    } else if (status === 'UNHANDLED') {
      where.isHandled = false;
    }

    if (planIntent !== 'ALL') {
      where.planIntent = planIntent;
    }

    if (inquiryType !== 'ALL') {
      where.inquiryType = inquiryType;
    }

    if (search) {
      where.OR = [
        { storeName: { contains: search } },
        { email: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const inquiries = await prisma.iRInquiry.findMany({
      where,
      include: {
        responses: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('Inquiries list error:', error);
    return NextResponse.json(
      { error: '문의 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

