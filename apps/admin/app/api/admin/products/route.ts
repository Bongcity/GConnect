import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        {
          user: {
            OR: [
              { email: { contains: search } },
              { shopName: { contains: search } },
            ],
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            shopName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('상품 조회 실패:', error);
    return NextResponse.json(
      { error: '상품 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

