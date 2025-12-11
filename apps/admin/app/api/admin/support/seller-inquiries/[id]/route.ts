import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * 셀러 문의 상세 조회
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
    });

    if (!inquiry) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error('Inquiry detail error:', error);
    return NextResponse.json(
      { error: '문의 상세 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 셀러 문의에 답변 등록
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { adminReply, status } = await req.json();

    if (!adminReply || !adminReply.trim()) {
      return NextResponse.json(
        { error: '답변 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 문의 업데이트
    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        adminReply,
        adminName: session.user.name || '관리자',
        repliedAt: new Date(),
        status: status || 'RESOLVED',
        updatedAt: new Date(),
      },
    });

    console.log(`✅ 문의 답변 등록 - ID: ${params.id}, 관리자: ${session.user.name}`);

    return NextResponse.json({
      ok: true,
      inquiry,
      message: '답변이 등록되었습니다.',
    });
  } catch (error) {
    console.error('Inquiry reply error:', error);
    return NextResponse.json(
      { error: '답변 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}

