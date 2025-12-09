import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { encrypt, decrypt } from '@/lib/crypto';

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
    if (!naverClientId) {
      return NextResponse.json(
        { error: '애플리케이션 ID는 필수입니다.' },
        { status: 400 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {
      naverClientId: naverClientId.trim(),
      naverApiEnabled: naverApiEnabled || false,
    };

    // Client Secret이 제공된 경우에만 암호화해서 저장
    // 마스킹된 값(•로 시작)은 저장하지 않음
    if (naverClientSecret && naverClientSecret.trim()) {
      // 마스킹 문자 체크 (•, *, -, _ 등)
      const isMasked = /^[•*\-_]+$/.test(naverClientSecret.trim());
      
      if (!isMasked) {
        updateData.naverClientSecret = encrypt(naverClientSecret.trim());
      }
      // 마스킹된 값인 경우 기존 값 유지 (updateData에 포함하지 않음)
    }

    // 설정 저장
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
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

    // Secret은 마스킹 처리 (복호화 가능한지 확인)
    let maskedSecret = '';
    if (user.naverClientSecret) {
      try {
        const decrypted = decrypt(user.naverClientSecret);
        // 복호화 성공 시에만 마스킹 표시
        maskedSecret = decrypted ? '••••••••••••••••' : '';
      } catch (error) {
        console.error('Failed to decrypt secret:', error);
        maskedSecret = '';
      }
    }

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

