import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

// ?ÅÌíà Î™©Î°ù Ï°∞Ìöå
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?∏Ï¶ù???ÑÏöî?©Îãà??' },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      ok: true,
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
      })),
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: '?ÅÌíà Î™©Î°ù Ï°∞Ìöå Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' },
      { status: 500 }
    );
  }
}

// ?ÅÌíà Ï∂îÍ?
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?∏Ï¶ù???ÑÏöî?©Îãà??' },
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

    // ?ÑÏàò ?ÑÎìú Í≤ÄÏ¶?
    if (!name || !price) {
      return NextResponse.json(
        { error: '?ÅÌíàÎ™ÖÍ≥º Í∞ÄÍ≤©Ï? ?ÑÏàò?ÖÎãà??' },
        { status: 400 }
      );
    }

    // Ïπ¥ÌÖåÍ≥†Î¶¨ Í≤ΩÎ°ú ?ùÏÑ±
    const categoryPath = [category1, category2, category3]
      .filter(Boolean)
      .join(' > ');

    // ?ÅÌíà ?ùÏÑ±
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
      { error: '?ÅÌíà Ï∂îÍ? Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' },
      { status: 500 }
    );
  }
}

