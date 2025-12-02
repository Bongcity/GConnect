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
    const { isRead } = body;

    const notification = await prisma.adminNotification.update({
      where: { id: params.id },
      data: { isRead },
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: '알림 업데이트에 실패했습니다.' },
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

    await prisma.adminNotification.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '알림이 삭제되었습니다.' });
  } catch (error) {
    console.error('Notification delete error:', error);
    return NextResponse.json(
      { error: '알림 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

