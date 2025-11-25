import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { registerCronJob, stopCronJob } from '@/lib/scheduler';

// ?§Ï?Ï§??§Ï†ï Ï°∞Ìöå
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?∏Ï¶ù???ÑÏöî?©Îãà??' },
        { status: 401 }
      );
    }

    const schedule = await prisma.syncSchedule.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      ok: true,
      schedule: schedule || null,
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json(
      { error: '?§Ï?Ï§?Ï°∞Ìöå Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' },
      { status: 500 }
    );
  }
}

// ?§Ï?Ï§??§Ï†ï ?Ä???òÏ†ï
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?∏Ï¶ù???ÑÏöî?©Îãà??' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      isEnabled,
      cronExpression,
      timezone,
      syncProducts,
      updateFeed,
      notifyOnSuccess,
      notifyOnError,
      notifyEmail,
    } = body;

    // Í∏∞Ï°¥ ?§Ï?Ï§??ïÏù∏
    const existingSchedule = await prisma.syncSchedule.findUnique({
      where: { userId: session.user.id },
    });

    let schedule;

    if (existingSchedule) {
      // ?òÏ†ï
      schedule = await prisma.syncSchedule.update({
        where: { id: existingSchedule.id },
        data: {
          isEnabled: isEnabled !== undefined ? isEnabled : existingSchedule.isEnabled,
          cronExpression: cronExpression || existingSchedule.cronExpression,
          timezone: timezone || existingSchedule.timezone,
          syncProducts: syncProducts !== undefined ? syncProducts : existingSchedule.syncProducts,
          updateFeed: updateFeed !== undefined ? updateFeed : existingSchedule.updateFeed,
          notifyOnSuccess: notifyOnSuccess !== undefined ? notifyOnSuccess : existingSchedule.notifyOnSuccess,
          notifyOnError: notifyOnError !== undefined ? notifyOnError : existingSchedule.notifyOnError,
          notifyEmail: notifyEmail !== undefined ? notifyEmail : existingSchedule.notifyEmail,
        },
        include: {
          user: {
            select: {
              naverClientId: true,
              naverClientSecret: true,
              naverApiEnabled: true,
            },
          },
        },
      });
    } else {
      // ?ùÏÑ±
      schedule = await prisma.syncSchedule.create({
        data: {
          userId: session.user.id,
          isEnabled: isEnabled || false,
          cronExpression: cronExpression || '0 2 * * *',
          timezone: timezone || 'Asia/Seoul',
          syncProducts: syncProducts !== undefined ? syncProducts : true,
          updateFeed: updateFeed !== undefined ? updateFeed : true,
          notifyOnSuccess: notifyOnSuccess || false,
          notifyOnError: notifyOnError !== undefined ? notifyOnError : true,
          notifyEmail: notifyEmail || null,
        },
        include: {
          user: {
            select: {
              naverClientId: true,
              naverClientSecret: true,
              naverApiEnabled: true,
            },
          },
        },
      });
    }

    // ?¨Î°† ?ëÏóÖ ?¨Îì±Î°?
    if (schedule.isEnabled) {
      await registerCronJob(schedule);
    } else {
      stopCronJob(session.user.id);
    }

    return NextResponse.json({
      ok: true,
      schedule,
    });
  } catch (error) {
    console.error('Save schedule error:', error);
    return NextResponse.json(
      { error: '?§Ï?Ï§??Ä??Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' },
      { status: 500 }
    );
  }
}

// ?§Ï?Ï§???†ú
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?∏Ï¶ù???ÑÏöî?©Îãà??' },
        { status: 401 }
      );
    }

    // ?¨Î°† ?ëÏóÖ Ï§ëÏ?
    stopCronJob(session.user.id);

    // ?§Ï?Ï§???†ú
    await prisma.syncSchedule.delete({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: '?§Ï?Ï§???†ú Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' },
      { status: 500 }
    );
  }
}

