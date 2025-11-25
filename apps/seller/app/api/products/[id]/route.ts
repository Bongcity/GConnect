import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

// 상품 상세 조회
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      product: {
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: '상품 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 상품 수정
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      salePrice,
      stockQuantity,
      isActive,
    } = body;

    // 상품 소유권 확인
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상품 수정
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: name || product.name,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? price : product.price,
        salePrice: salePrice !== undefined ? salePrice : product.salePrice,
        stockQuantity: stockQuantity !== undefined ? stockQuantity : product.stockQuantity,
        isActive: isActive !== undefined ? isActive : product.isActive,
      },
    });

    return NextResponse.json({
      ok: true,
      product: {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        salePrice: updatedProduct.salePrice ? Number(updatedProduct.salePrice) : null,
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: '상품 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 상품 삭제
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 상품 소유권 확인
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상품 삭제
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      ok: true,
      message: '상품이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: '상품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

