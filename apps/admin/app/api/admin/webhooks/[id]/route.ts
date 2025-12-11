import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await req.json();
    const { 
      name, 
      url, 
      type, 
      isEnabled, 
      triggerOnSuccess, 
      triggerOnError,
      retryEnabled,
      maxRetries,
      retryDelay,
    } = body;

    // 웹훅 수정
    const webhook = await prisma.webhook.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(url !== undefined && { url }),
        ...(type !== undefined && { type }),
        ...(isEnabled !== undefined && { isEnabled }),
        ...(triggerOnSuccess !== undefined && { triggerOnSuccess }),
        ...(triggerOnError !== undefined && { triggerOnError }),
        ...(retryEnabled !== undefined && { retryEnabled }),
        ...(maxRetries !== undefined && { maxRetries }),
        ...(retryDelay !== undefined && { retryDelay }),
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
    console.error('Failed to update webhook:', error);
    return NextResponse.json(
      { error: '웹훅 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 웹훅 삭제
    await prisma.webhook.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '웹훅이 삭제되었습니다.' });
  } catch (error) {
    console.error('Failed to delete webhook:', error);
    return NextResponse.json(
      { error: '웹훅 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

