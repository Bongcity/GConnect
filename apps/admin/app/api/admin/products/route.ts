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

    // 상태 필터링 (enabled 필드 사용)
    if (status === 'ACTIVE') {
      where.enabled = true;
    } else if (status === 'INACTIVE') {
      where.enabled = false;
    } else if (status === 'GOOGLE_ENABLED') {
      where.google_in = 1;
    }
    // 'ALL'인 경우 where 조건 없음

    if (search) {
      where.OR = [
        { product_name: { contains: search } },
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
      select: {
        id: true,
        product_name: true,
        sale_price: true,
        representative_product_image_url: true,
        enabled: true,
        google_in: true,
        product_url: true,
        store_name: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            id: true,
            email: true,
            shopName: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 500, // 더 많은 상품 조회
    });

    // BigInt를 문자열로 변환
    const serializedProducts = products.map((product) => ({
      ...product,
      id: product.id.toString(),
      sale_price: product.sale_price ? product.sale_price.toString() : null,
    }));

    // 통계 정보도 함께 반환
    const totalCount = await prisma.product.count({ where });
    const googleEnabledCount = await prisma.product.count({
      where: { ...where, google_in: 1 },
    });
    const activeCount = await prisma.product.count({
      where: { ...where, enabled: true },
    });

    return NextResponse.json({
      products: serializedProducts,
      stats: {
        total: totalCount,
        googleEnabled: googleEnabledCount,
        active: activeCount,
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

