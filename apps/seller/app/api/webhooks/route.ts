import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@gconnect/db';
import { encrypt } from '@/lib/naver-api';

// 웹훅 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const webhooks = await db.webhook.findMany({
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
      { error: '웹훅 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 웹훅 생성
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
      url,
      type,
      isEnabled,
      triggerOnSuccess,
      triggerOnError,
      authType,
      authValue,
      customHeaders,
    } = body;

    // 필수 필드 검증
    if (!name || !url || !type) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // URL 검증
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: '올바른 URL 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // authValue 암호화
    let encryptedAuthValue = null;
    if (authType && authValue) {
      encryptedAuthValue = encrypt(authValue);
    }

    // 웹훅 생성
    const webhook = await db.webhook.create({
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
      { error: '웹훅 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

