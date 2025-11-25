import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

// ?„ë¡œ??ì¡°íšŒ
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?¸ì¦???„ìš”?©ë‹ˆ??' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        shopName: true,
        shopStatus: true,
        naverShopUrl: true,
        naverShopId: true,
        businessNumber: true,
        phone: true,
        naverUserId: true,
        naverEmail: true,
        naverClientId: true,
        naverClientSecret: true,
        naverApiEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '?¬ìš©?ë? ì°¾ì„ ???†ìŠµ?ˆë‹¤.' },
        { status: 404 }
      );
    }

    // naverClientSecret ë§ˆìŠ¤??ì²˜ë¦¬
    const maskedUser = {
      ...user,
      naverClientSecret: user.naverClientSecret ? '?¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€? : null,
    };

    return NextResponse.json(maskedUser);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: '?„ë¡œ??ì¡°íšŒ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}

// ?„ë¡œ???˜ì •
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?¸ì¦???„ìš”?©ë‹ˆ??' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name } = body;

    // ?„ìˆ˜ ?„ë“œ ê²€ì¦?
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: '?´ë¦„?€ ìµœì†Œ 2???´ìƒ?´ì–´???©ë‹ˆ??' },
        { status: 400 }
      );
    }

    // ?„ë¡œ???…ë°?´íŠ¸
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: '?„ë¡œ???˜ì • ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}

