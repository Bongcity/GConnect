import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@gconnect/db';
import { encrypt } from '@/lib/naver-api';

// 웹훅 상세 조회
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const webhook = await db.webhook.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: '웹훅을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      webhook,
    });
  } catch (error) {
    console.error('Get webhook error:', error);
    return NextResponse.json(
      { error: '웹훅 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 웹훅 수정
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 웹훅 존재 확인
    const existingWebhook = await db.webhook.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingWebhook) {
      return NextResponse.json(
        { error: '웹훅을 찾을 수 없습니다.' },
        { status: 404 }
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

    // URL 검증
    if (url) {
      try {
        new URL(url);
      } catch (e) {
        return NextResponse.json(
          { error: '올바른 URL 형식이 아닙니다.' },
          { status: 400 }
        );
      }
    }

    // authValue 암호화
    let encryptedAuthValue = existingWebhook.authValue;
    if (authValue) {
      encryptedAuthValue = encrypt(authValue);
    } else if (authType === 'NONE') {
      encryptedAuthValue = null;
    }

    // 웹훅 수정
    const webhook = await db.webhook.update({
      where: { id: params.id },
      data: {
        name: name || existingWebhook.name,
        url: url || existingWebhook.url,
        type: type || existingWebhook.type,
        isEnabled: isEnabled !== undefined ? isEnabled : existingWebhook.isEnabled,
        triggerOnSuccess:
          triggerOnSuccess !== undefined ? triggerOnSuccess : existingWebhook.triggerOnSuccess,
        triggerOnError:
          triggerOnError !== undefined ? triggerOnError : existingWebhook.triggerOnError,
        authType: authType !== undefined ? authType : existingWebhook.authType,
        authValue: encryptedAuthValue,
        customHeaders:
          customHeaders !== undefined
            ? customHeaders
              ? JSON.stringify(customHeaders)
              : null
            : existingWebhook.customHeaders,
      },
    });

    return NextResponse.json({
      ok: true,
      webhook,
    });
  } catch (error) {
    console.error('Update webhook error:', error);
    return NextResponse.json(
      { error: '웹훅 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 웹훅 삭제
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 웹훅 존재 확인
    const webhook = await db.webhook.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: '웹훅을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 웹훅 삭제
    await db.webhook.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error('Delete webhook error:', error);
    return NextResponse.json(
      { error: '웹훅 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

