import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@gconnect/db';
import { registerSchema } from '@gconnect/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 유효성 검사
    const validated = registerSchema.parse(body);

    // 이메일 중복 확인
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // 사용자 생성
    const user = await db.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        shopName: validated.shopName,
        shopStatus: 'PENDING',
      },
    });

    // 비밀번호 제외하고 반환
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

    // Zod validation 에러
    if (error.errors) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

