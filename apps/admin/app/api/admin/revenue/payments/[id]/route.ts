import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        subscription: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                shopName: true,
              },
            },
            plan: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: '결제 내역을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Payment detail error:', error);
    return NextResponse.json(
      { error: '결제 상세 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

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
    const { status, refundReason } = body;

    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'REFUNDED' && {
          refundReason,
          refundedAt: new Date(),
          refundedBy: session.user.id,
        }),
      },
      include: {
        subscription: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
            plan: true,
          },
        },
      },
    });

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      { error: '결제 상태 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}

