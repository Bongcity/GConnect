import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * 문의 생성
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { title, content, category } = await req.json();

    // 유효성 검사
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: '제목은 200자 이하여야 합니다.' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: '내용은 2000자 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        name: true,
        shopName: true,
      },
    });

    // 문의 생성
    const inquiry = await prisma.inquiry.create({
      data: {
        userId: session.user.id,
        title,
        content,
        category: category || 'GENERAL',
        status: 'PENDING',
        userEmail: user?.email || '',
        userName: user?.name || '',
        userShopName: user?.shopName || null,
      },
    });

    console.log(`✅ 문의 접수 - 사용자: ${session.user.id}, 제목: ${title}`);

    return NextResponse.json({
      ok: true,
      inquiryId: inquiry.id,
      message: '문의가 성공적으로 접수되었습니다.',
    });
  } catch (error) {
    console.error('Inquiry creation error:', error);
    return NextResponse.json(
      { error: '문의 접수 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 사용자 본인의 문의 목록 조회
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const inquiries = await prisma.inquiry.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        adminReply: true,
        adminName: true,
        repliedAt: true,
      },
    });

    return NextResponse.json({
      inquiries,
    });
  } catch (error) {
    console.error('Inquiry list error:', error);
    return NextResponse.json(
      { error: '문의 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

