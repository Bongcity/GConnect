import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@gconnect/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: BigInt(params.id) as any,
      },
      include: {
        user: {
          select: {
            shopName: true,
            naverShopUrl: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('상품 조회 실패:', error);
    return NextResponse.json(
      { error: '상품 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

