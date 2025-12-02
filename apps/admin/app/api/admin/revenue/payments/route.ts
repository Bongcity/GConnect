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
    const method = searchParams.get('method') || 'ALL';

    const where: any = {};

    if (status !== 'ALL') {
      where.status = status;
    }

    if (method !== 'ALL') {
      where.method = method;
    }

    if (search) {
      where.OR = [
        { transactionId: { contains: search } },
        {
          subscription: {
            user: {
              OR: [
                { email: { contains: search } },
                { name: { contains: search } },
              ],
            },
          },
        },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
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
            plan: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Payments list error:', error);
    return NextResponse.json(
      { error: '결제 내역 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

