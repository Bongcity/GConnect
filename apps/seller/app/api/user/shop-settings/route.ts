import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@gconnect/db';

// 상점 설정 수정
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
    const { shopName, naverShopUrl, naverShopId, businessNumber, phone } = body;

    // 필수 필드 검증
    if (!shopName || shopName.trim().length < 2) {
      return NextResponse.json(
        { error: '상점명은 최소 2자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    if (!naverShopUrl || !naverShopUrl.includes('smartstore.naver.com')) {
      return NextResponse.json(
        { error: '올바른 네이버 스마트스토어 URL을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 상점 설정 업데이트
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        shopName: shopName.trim(),
        naverShopUrl: naverShopUrl.trim(),
        naverShopId: naverShopId?.trim() || null,
        businessNumber: businessNumber?.trim() || null,
        phone: phone?.trim() || null,
        shopStatus: 'ACTIVE', // 상점 설정이 완료되면 ACTIVE로 변경
      },
      select: {
        id: true,
        shopName: true,
        shopStatus: true,
        naverShopUrl: true,
        naverShopId: true,
        businessNumber: true,
        phone: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update shop settings error:', error);
    return NextResponse.json(
      { error: '상점 설정 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

