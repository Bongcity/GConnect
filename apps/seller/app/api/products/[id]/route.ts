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

    // BigInt로 변환
    const productId = BigInt(params.id);

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        user_id: session.user.id,
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
        id: product.id.toString(),
        name: product.product_name || '상품명 없음',
        description: null, // affiliate_products 테이블에는 description 없음
        price: Number(product.sale_price || 0),
        salePrice: product.discounted_sale_price ? Number(product.discounted_sale_price) : null,
        imageUrl: product.representative_product_image_url,
        thumbnailUrl: product.representative_product_image_url,
        stockQuantity: null,
        isActive: product.enabled ?? true,
        isGoogleExposed: product.google_in === 1,
        syncStatus: 'SYNCED',
        categoryPath: product.source_keyword || null,
        naverProductId: product.naver_product_id || null,
        lastSyncedAt: product.updated_at?.toISOString(),
        createdAt: product.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: product.updated_at?.toISOString() || new Date().toISOString(),
        // 원본 데이터
        _raw: {
          store_name: product.store_name,
          brand_store: product.brand_store,
          product_status: product.product_status,
          product_url: product.product_url,
          discounted_rate: product.discounted_rate,
          commission_rate: product.commission_rate,
          promotion_commission_rate: product.promotion_commission_rate,
        },
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

// 상품 수정 (활성화 상태, 구글 노출만 수정 가능)
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
    const { isActive, isGoogleExposed } = body;

    // BigInt로 변환
    const productId = BigInt(params.id);

    // 상품 소유권 확인
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        user_id: session.user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상품 수정 (네이버 동기화 데이터는 수정 불가)
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        enabled: isActive !== undefined ? isActive : product.enabled,
        google_in: isGoogleExposed !== undefined ? (isGoogleExposed ? 1 : 0) : product.google_in,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      product: {
        id: updatedProduct.id.toString(),
        name: updatedProduct.product_name || '상품명 없음',
        price: Number(updatedProduct.sale_price || 0),
        salePrice: updatedProduct.discounted_sale_price ? Number(updatedProduct.discounted_sale_price) : null,
        imageUrl: updatedProduct.representative_product_image_url,
        isActive: updatedProduct.enabled ?? true,
        isGoogleExposed: updatedProduct.google_in === 1,
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

    // BigInt로 변환
    const productId = BigInt(params.id);

    // 상품 소유권 확인
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        user_id: session.user.id,
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
      where: { id: productId },
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

