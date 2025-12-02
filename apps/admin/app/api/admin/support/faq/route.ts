import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const faqs = await prisma.fAQ.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('FAQ list error:', error);
    return NextResponse.json(
      { error: 'FAQ 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await req.json();
    const { category, question, answer, isPublic, sortOrder } = body;

    const faq = await prisma.fAQ.create({
      data: {
        category,
        question,
        answer,
        isPublic: isPublic ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ faq });
  } catch (error) {
    console.error('FAQ create error:', error);
    return NextResponse.json(
      { error: 'FAQ 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

