import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@gconnect/db';
import { registerSchema } from '@gconnect/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ? íš¨??ê²€??
    const validated = registerSchema.parse(body);

    // ?´ë©”??ì¤‘ë³µ ?•ì¸
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '?´ë? ?¬ìš© ì¤‘ì¸ ?´ë©”?¼ì…?ˆë‹¤.' },
        { status: 400 }
      );
    }

    // ë¹„ë?ë²ˆí˜¸ ?´ì‹±
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // ?¬ìš©???ì„±
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        shopName: validated.shopName,
        shopStatus: 'PENDING',
      },
    });

    // ë¹„ë?ë²ˆí˜¸ ?œì™¸?˜ê³  ë°˜í™˜
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        ok: true,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);

    // Zod validation ?ëŸ¬
    if (error.errors) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '?Œì›ê°€??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}

