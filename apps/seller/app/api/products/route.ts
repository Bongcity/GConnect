import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

// 상품 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({
      ok: true,
      products: products.map((p) => ({
        id: p.id.toString(),
        name: p.product_name || '상품명 없음',
        price: Number(p.sale_price || 0),
        salePrice: p.discounted_sale_price ? Number(p.discounted_sale_price) : null,
        imageUrl: p.representative_product_image_url,
        thumbnailUrl: p.representative_product_image_url,
        stockQuantity: null,
        isActive: p.enabled ?? true,
        isGoogleExposed: p.google_in === 1,
        syncStatus: 'SYNCED',
        categoryPath: p.source_keyword || null,
        updatedAt: p.updated_at?.toISOString() || new Date().toISOString(),
        // 원본 데이터도 포함 (상세 페이지용)
        _raw: {
          store_name: p.store_name,
          product_status: p.product_status,
          product_url: p.product_url,
          discounted_rate: p.discounted_rate,
        }
      })),
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: '상품 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 상품 추가
export async function POST(req: Request) {
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
      imageUrl,
      thumbnailUrl,
      category1,
      category2,
      category3,
      naverProductId,
      naverProductNo,
    } = body;

    // 필수 필드 검증
    if (!name || !price) {
      return NextResponse.json(
        { error: '상품명과 가격은 필수입니다.' },
        { status: 400 }
      );
    }

    // 카테고리 경로 생성
    const categoryPath = [category1, category2, category3]
      .filter(Boolean)
      .join(' > ');

    // 상품 생성
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        name,
        description,
        price,
        salePrice: salePrice || null,
        stockQuantity: stockQuantity || null,
        imageUrl: imageUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        category1: category1 || null,
        category2: category2 || null,
        category3: category3 || null,
        categoryPath: categoryPath || null,
        naverProductId: naverProductId || null,
        naverProductNo: naverProductNo || null,
        syncStatus: 'PENDING',
        isActive: true,
        isGoogleExposed: false,
      },
    });

    return NextResponse.json({
      ok: true,
      product: {
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
      },
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: '상품 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

