import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { encrypt } from '@/lib/crypto';

// 네이버 API 설정 저장
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { naverClientId, naverClientSecret, naverApiEnabled } = body;

    // 필수 필드 검증
    if (!naverClientId || !naverClientSecret) {
      return NextResponse.json(
        { error: 'Client ID와 Client Secret은 필수입니다.' },
        { status: 400 }
      );
    }

    // Client Secret 암호화
    const encryptedSecret = encrypt(naverClientSecret);

    // 설정 저장
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        naverClientId: naverClientId.trim(),
        naverClientSecret: encryptedSecret,
        naverApiEnabled: naverApiEnabled || false,
      },
      select: {
        id: true,
        naverClientId: true,
        naverApiEnabled: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Save naver API settings error:', error);
    return NextResponse.json(
      { error: '네이버 API 설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 네이버 API 설정 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        naverClientId: true,
        naverClientSecret: true,
        naverApiEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Secret은 마스킹 처리
    const maskedSecret = user.naverClientSecret
      ? '••••••••••••••••'
      : '';

    return NextResponse.json({
      naverClientId: user.naverClientId || '',
      naverClientSecret: maskedSecret,
      naverApiEnabled: user.naverApiEnabled || false,
    });
  } catch (error) {
    console.error('Get naver API settings error:', error);
    return NextResponse.json(
      { error: '네이버 API 설정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

