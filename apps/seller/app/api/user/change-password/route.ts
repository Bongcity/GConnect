import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import bcrypt from 'bcryptjs';

// ë¹„ë?ë²ˆí˜¸ ë³€ê²?
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
    const { currentPassword, newPassword } = body;

    // ?„ìˆ˜ ?„ë“œ ê²€ì¦?
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '?„ì¬ ë¹„ë?ë²ˆí˜¸?€ ??ë¹„ë?ë²ˆí˜¸ë¥??…ë ¥?´ì£¼?¸ìš”.' },
        { status: 400 }
      );
    }

    // ë¹„ë?ë²ˆí˜¸ ê°•ë„ ê²€ì¦?
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: '??ë¹„ë?ë²ˆí˜¸??ìµœì†Œ 8???´ìƒ?´ì–´???©ë‹ˆ??' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: '??ë¹„ë?ë²ˆí˜¸???€ë¬¸ìë¥??¬í•¨?´ì•¼ ?©ë‹ˆ??' },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { error: '??ë¹„ë?ë²ˆí˜¸???Œë¬¸?ë? ?¬í•¨?´ì•¼ ?©ë‹ˆ??' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: '??ë¹„ë?ë²ˆí˜¸???«ìë¥??¬í•¨?´ì•¼ ?©ë‹ˆ??' },
        { status: 400 }
      );
    }

    // ?¬ìš©??ì¡°íšŒ
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'ë¹„ë?ë²ˆí˜¸ë¥?ë³€ê²½í•  ???†ìŠµ?ˆë‹¤. ?Œì…œ ë¡œê·¸???¬ìš©?ì…?ˆë‹¤.' },
        { status: 400 }
      );
    }

    // ?„ì¬ ë¹„ë?ë²ˆí˜¸ ?•ì¸
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '?„ì¬ ë¹„ë?ë²ˆí˜¸ê°€ ?¼ì¹˜?˜ì? ?ŠìŠµ?ˆë‹¤.' },
        { status: 400 }
      );
    }

    // ??ë¹„ë?ë²ˆí˜¸ ?´ì‹±
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // ë¹„ë?ë²ˆí˜¸ ?…ë°?´íŠ¸
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'ë¹„ë?ë²ˆí˜¸ê°€ ë³€ê²½ë˜?ˆìŠµ?ˆë‹¤.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'ë¹„ë?ë²ˆí˜¸ ë³€ê²?ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}

