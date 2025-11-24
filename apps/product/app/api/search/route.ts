import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@gconnect/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    if (!q) {
      return NextResponse.json({ products: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    // 정렬 옵션
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_low') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_high') {
      orderBy = { price: 'desc' };
    }

    // 검색 조건
    const where = {
      status: 'ACTIVE',
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
      ],
    };

    // 상품 조회
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
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
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      query: q,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('검색 실패:', error);
    return NextResponse.json(
      { error: '검색에 실패했습니다.' },
      { status: 500 }
    );
  }
}

