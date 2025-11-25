import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

// 피드 설정 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const feedSettings = await prisma.feedSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!feedSettings) {
      // 설정이 없으면 기본값 반환
      return NextResponse.json({
        ok: true,
        settings: null,
        feedUrl: null,
      });
    }

    // 피드 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3003';
    const feedUrl = `${baseUrl}/api/feed/${session.user.id}`;

    return NextResponse.json({
      ok: true,
      settings: feedSettings,
      feedUrl,
    });
  } catch (error) {
    console.error('Get feed settings error:', error);
    return NextResponse.json(
      { error: '피드 설정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 피드 설정 저장/수정
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
      feedTitle,
      feedDescription,
      storeUrl,
      storeName,
      merchantId,
      includeInactive,
      autoUpdate,
      updateFrequency,
    } = body;

    // 필수 필드 검증
    if (!feedTitle) {
      return NextResponse.json(
        { error: '피드 제목은 필수입니다.' },
        { status: 400 }
      );
    }

    // 기존 설정 확인
    const existingSettings = await prisma.feedSettings.findUnique({
      where: { userId: session.user.id },
    });

    let feedSettings;

    if (existingSettings) {
      // 수정
      feedSettings = await prisma.feedSettings.update({
        where: { id: existingSettings.id },
        data: {
          feedTitle,
          feedDescription: feedDescription || null,
          storeUrl: storeUrl || null,
          storeName: storeName || null,
          merchantId: merchantId || null,
          includeInactive: includeInactive || false,
          autoUpdate: autoUpdate !== undefined ? autoUpdate : true,
          updateFrequency: updateFrequency || 24,
        },
      });
    } else {
      // 생성
      feedSettings = await prisma.feedSettings.create({
        data: {
          userId: session.user.id,
          feedTitle,
          feedDescription: feedDescription || null,
          storeUrl: storeUrl || null,
          storeName: storeName || null,
          merchantId: merchantId || null,
          includeInactive: includeInactive || false,
          autoUpdate: autoUpdate !== undefined ? autoUpdate : true,
          updateFrequency: updateFrequency || 24,
        },
      });
    }

    // 피드 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3003';
    const feedUrl = `${baseUrl}/api/feed/${session.user.id}`;

    return NextResponse.json({
      ok: true,
      settings: feedSettings,
      feedUrl,
    });
  } catch (error) {
    console.error('Save feed settings error:', error);
    return NextResponse.json(
      { error: '피드 설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


