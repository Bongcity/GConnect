import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { decrypt } from '@/lib/crypto';

// 프로필 조회
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
        id: true,
        email: true,
        name: true,
        shopName: true,
        shopStatus: true,
        naverShopUrl: true,
        naverShopId: true,
        businessNumber: true,
        phone: true,
        naverUserId: true,
        naverEmail: true,
        naverClientId: true,
        naverClientSecret: true,
        naverApiEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // naverClientSecret 마스킹 처리 (복호화 가능한지 확인)
    let maskedSecret = null;
    if (user.naverClientSecret) {
      try {
        const decrypted = decrypt(user.naverClientSecret);
        // 복호화 성공 시에만 마스킹 표시
        maskedSecret = decrypted ? '••••••••••••••••' : null;
      } catch (error) {
        console.error('Failed to decrypt secret in profile:', error);
        maskedSecret = null;
      }
    }

    const maskedUser = {
      ...user,
      naverClientSecret: maskedSecret,
    };

    return NextResponse.json(maskedUser);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: '프로필 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 프로필 수정
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
    const { name } = body;

    // 필수 필드 검증
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: '이름은 최소 2자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 프로필 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: '프로필 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

