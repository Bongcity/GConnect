import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

/**
 * Admin 구독 수정 API
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Admin 권한 확인
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await req.json();
    const { status, endDate, autoRenew } = body;

    // 구독 존재 확인
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!existingSubscription) {
      return NextResponse.json({ error: '구독을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 구독 수정
    const subscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(autoRenew !== undefined && { autoRenew }),
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
        plan: {
          select: {
            id: true,
            name: true,
            displayName: true,
            maxProducts: true,
            monthlyPrice: true,
          },
        },
      },
    });

    console.log(`[Admin] 구독 수정: ${subscription.id} (${subscription.user.email})`);

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error('[Admin Subscription Update] 실패:', error);
    return NextResponse.json(
      { error: error.message || '구독 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

