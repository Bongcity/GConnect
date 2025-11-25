import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

// ?ì  ?¤ì • ?˜ì •
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
    const { shopName, naverShopUrl, naverShopId, businessNumber, phone } = body;

    // ?„ìˆ˜ ?„ë“œ ê²€ì¦?
    if (!shopName || shopName.trim().length < 2) {
      return NextResponse.json(
        { error: '?ì ëª…ì? ìµœì†Œ 2???´ìƒ?´ì–´???©ë‹ˆ??' },
        { status: 400 }
      );
    }

    if (!naverShopUrl || !naverShopUrl.includes('smartstore.naver.com')) {
      return NextResponse.json(
        { error: '?¬ë°”ë¥??¤ì´ë²??¤ë§ˆ?¸ìŠ¤? ì–´ URL???…ë ¥?´ì£¼?¸ìš”.' },
        { status: 400 }
      );
    }

    // ?ì  ?¤ì • ?…ë°?´íŠ¸
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        shopName: shopName.trim(),
        naverShopUrl: naverShopUrl.trim(),
        naverShopId: naverShopId?.trim() || null,
        businessNumber: businessNumber?.trim() || null,
        phone: phone?.trim() || null,
        shopStatus: 'ACTIVE', // ?ì  ?¤ì •???„ë£Œ?˜ë©´ ACTIVEë¡?ë³€ê²?
      },
      select: {
        id: true,
        shopName: true,
        shopStatus: true,
        naverShopUrl: true,
        naverShopId: true,
        businessNumber: true,
        phone: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update shop settings error:', error);
    return NextResponse.json(
      { error: '?ì  ?¤ì • ?˜ì • ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}

