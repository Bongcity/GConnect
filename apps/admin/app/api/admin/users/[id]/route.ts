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
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const { shopStatus } = await req.json();

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { shopStatus },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('사용자 상태 변경 실패:', error);
    return NextResponse.json(
      { error: '사용자 상태 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}

