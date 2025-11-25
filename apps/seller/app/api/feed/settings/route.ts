import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

// ?¼ë“œ ?¤ì • ì¡°íšŒ
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?¸ì¦???„ìš”?©ë‹ˆ??' },
        { status: 401 }
      );
    }

    const feedSettings = await prisma.feedSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!feedSettings) {
      // ?¤ì •???†ìœ¼ë©?ê¸°ë³¸ê°?ë°˜í™˜
      return NextResponse.json({
        ok: true,
        settings: null,
        feedUrl: null,
      });
    }

    // ?¼ë“œ URL ?ì„±
    const baseUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3003';
    const feedUrl = `${baseUrl}/api/feed/${session.user.id}`;

    return NextResponse.json({
      ok: true,
      settings: feedSettings,
      feedUrl,
    });
  } catch (error) {
    console.error('Get feed settings error:', error);
    return NextResponse.json(
      { error: '?¼ë“œ ?¤ì • ì¡°íšŒ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}

// ?¼ë“œ ?¤ì • ?€???˜ì •
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
      feedTitle,
      feedDescription,
      storeUrl,
      storeName,
      merchantId,
      includeInactive,
      autoUpdate,
      updateFrequency,
    } = body;

    // ?„ìˆ˜ ?„ë“œ ê²€ì¦?
    if (!feedTitle) {
      return NextResponse.json(
        { error: '?¼ë“œ ?œëª©?€ ?„ìˆ˜?…ë‹ˆ??' },
        { status: 400 }
      );
    }

    // ê¸°ì¡´ ?¤ì • ?•ì¸
    const existingSettings = await prisma.feedSettings.findUnique({
      where: { userId: session.user.id },
    });

    let feedSettings;

    if (existingSettings) {
      // ?˜ì •
      feedSettings = await prisma.feedSettings.update({
        where: { id: existingSettings.id },
        data: {
          feedTitle,
          feedDescription: feedDescription || null,
          storeUrl: storeUrl || null,
          storeName: storeName || null,
          merchantId: merchantId || null,
          includeInactive: includeInactive || false,
          autoUpdate: autoUpdate !== undefined ? autoUpdate : true,
          updateFrequency: updateFrequency || 24,
        },
      });
    } else {
      // ?ì„±
      feedSettings = await prisma.feedSettings.create({
        data: {
          userId: session.user.id,
          feedTitle,
          feedDescription: feedDescription || null,
          storeUrl: storeUrl || null,
          storeName: storeName || null,
          merchantId: merchantId || null,
          includeInactive: includeInactive || false,
          autoUpdate: autoUpdate !== undefined ? autoUpdate : true,
          updateFrequency: updateFrequency || 24,
        },
      });
    }

    // ?¼ë“œ URL ?ì„±
    const baseUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3003';
    const feedUrl = `${baseUrl}/api/feed/${session.user.id}`;

    return NextResponse.json({
      ok: true,
      settings: feedSettings,
      feedUrl,
    });
  } catch (error) {
    console.error('Save feed settings error:', error);
    return NextResponse.json(
      { error: '?¼ë“œ ?¤ì • ?€??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}


