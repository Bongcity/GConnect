import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { executeSyncJob } from '@/lib/scheduler';

// ?˜ë™ ?™ê¸°???¤í–‰
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '?¸ì¦???„ìš”?©ë‹ˆ??' },
        { status: 401 }
      );
    }

    // ë°±ê·¸?¼ìš´?œì—???™ê¸°???¤í–‰
    // awaitë¥??¬ìš©?˜ì? ?Šì•„ ì¦‰ì‹œ ?‘ë‹µ ë°˜í™˜
    executeSyncJob(session.user.id).catch((error) => {
      console.error('Manual sync error:', error);
    });

    return NextResponse.json({
      ok: true,
      message: '?™ê¸°???‘ì—…???œì‘?˜ì—ˆ?µë‹ˆ??',
    });
  } catch (error) {
    console.error('Run sync error:', error);
    return NextResponse.json(
      { error: '?™ê¸°???¤í–‰ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' },
      { status: 500 }
    );
  }
}

