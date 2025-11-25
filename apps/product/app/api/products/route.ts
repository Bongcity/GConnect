import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@gconnect/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    // 정렬 옵션
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_low') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_high') {
      orderBy = { price: 'desc' };
    }

    // 상품 조회
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
        },
        include: {
          user: {
            select: {
              shopName: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip,
      }),
      prisma.product.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('상품 조회 실패:', error);
    return NextResponse.json(
      { error: '상품 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

