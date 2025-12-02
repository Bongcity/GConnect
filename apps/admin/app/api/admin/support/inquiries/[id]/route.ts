import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await req.json();
    const { response, isHandled } = body;

    // 답변 추가
    if (response) {
      await prisma.inquiryResponse.create({
        data: {
          inquiryId: parseInt(params.id),
          adminId: session.user.id!,
          adminName: session.user.name || session.user.email!,
          response,
        },
      });
    }

    // 문의 상태 업데이트
    const inquiry = await prisma.iRInquiry.update({
      where: { id: parseInt(params.id) },
      data: {
        isHandled: isHandled ?? true,
        handledAt: new Date(),
        handlerUserId: session.user.id,
      },
      include: {
        responses: true,
      },
    });

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error('Inquiry update error:', error);
    return NextResponse.json(
      { error: '문의 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}

