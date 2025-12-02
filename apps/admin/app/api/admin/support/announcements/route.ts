import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const announcements = await prisma.announcement.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Announcements list error:', error);
    return NextResponse.json(
      { error: '공지사항 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, isPinned, isPublic, startDate, endDate } = body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        isPinned: isPinned ?? false,
        isPublic: isPublic ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Announcement create error:', error);
    return NextResponse.json(
      { error: '공지사항 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

