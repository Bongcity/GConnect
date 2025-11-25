import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { encrypt } from '@/lib/naver-api';

// ?�이�?API ?�정 ?�??
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?�증???�요?�니??' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { naverClientId, naverClientSecret, naverApiEnabled } = body;

    // ?�수 ?�드 검�?
    if (!naverClientId || !naverClientSecret) {
      return NextResponse.json(
        { error: 'Client ID?� Client Secret?� ?�수?�니??' },
        { status: 400 }
      );
    }

    // Client Secret ?�호??
    const encryptedSecret = encrypt(naverClientSecret);

    // ?�정 ?�??
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
      { error: '?�이�?API ?�정 ?�??�??�류가 발생?�습?�다.' },
      { status: 500 }
    );
  }
}

// ?�이�?API ?�정 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?�증???�요?�니??' },
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
        { error: '?�용?��? 찾을 ???�습?�다.' },
        { status: 404 }
      );
    }

    // Secret?� 마스??처리
    const maskedSecret = user.naverClientSecret
      ? '?�••••••••••••••�?
      : '';

    return NextResponse.json({
      naverClientId: user.naverClientId || '',
      naverClientSecret: maskedSecret,
      naverApiEnabled: user.naverApiEnabled || false,
    });
  } catch (error) {
    console.error('Get naver API settings error:', error);
    return NextResponse.json(
      { error: '?�이�?API ?�정 조회 �??�류가 발생?�습?�다.' },
      { status: 500 }
    );
  }
}

