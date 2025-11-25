import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { encrypt } from '@/lib/naver-api';

// ?¹í›… ëª©ë¡ ì¡°íšŒ
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?¸ì¦???„ìš”?©ë‹ˆ??' },
        { status: 401 }
      );
    }

    const webhooks = await prisma.webhook.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      ok: true,
      webhooks,
    });
  } catch (error) {
    console.error('Get webhooks error:', error);
    return NextResponse.json(
      { error: '?¹í›… ì¡°íšŒ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}

// ?¹í›… ?ì„±
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?¸ì¦???„ìš”?©ë‹ˆ??' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      url,
      type,
      isEnabled,
      triggerOnSuccess,
      triggerOnError,
      authType,
      authValue,
      customHeaders,
    } = body;

    // ?„ìˆ˜ ?„ë“œ ê²€ì¦?
    if (!name || !url || !type) {
      return NextResponse.json(
        { error: '?„ìˆ˜ ?„ë“œê°€ ?„ë½?˜ì—ˆ?µë‹ˆ??' },
        { status: 400 }
      );
    }

    // URL ê²€ì¦?
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: '?¬ë°”ë¥?URL ?•ì‹???„ë‹™?ˆë‹¤.' },
        { status: 400 }
      );
    }

    // authValue ?”í˜¸??
    let encryptedAuthValue = null;
    if (authType && authValue) {
      encryptedAuthValue = encrypt(authValue);
    }

    // ?¹í›… ?ì„±
    const webhook = await prisma.webhook.create({
      data: {
        userId: session.user.id,
        name,
        url,
        type,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        triggerOnSuccess: triggerOnSuccess !== undefined ? triggerOnSuccess : true,
        triggerOnError: triggerOnError !== undefined ? triggerOnError : true,
        authType: authType || null,
        authValue: encryptedAuthValue,
        customHeaders: customHeaders ? JSON.stringify(customHeaders) : null,
      },
    });

    return NextResponse.json({
      ok: true,
      webhook,
    });
  } catch (error) {
    console.error('Create webhook error:', error);
    return NextResponse.json(
      { error: '?¹í›… ?ì„± ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}

