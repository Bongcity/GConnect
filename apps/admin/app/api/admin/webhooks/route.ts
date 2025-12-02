import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 모든 웹훅 조회 (사용자 정보 포함)
    const webhooks = await prisma.webhook.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            shopName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      webhooks,
    });
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
    return NextResponse.json(
      { error: '웹훅 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, name, url, type, isEnabled, triggerOnSuccess, triggerOnError } = body;

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 웹훅 생성
    const webhook = await prisma.webhook.create({
      data: {
        userId,
        name,
        url,
        type,
        isEnabled,
        triggerOnSuccess,
        triggerOnError,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            shopName: true,
          },
        },
      },
    });

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Failed to create webhook:', error);
    return NextResponse.json(
      { error: '웹훅 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

