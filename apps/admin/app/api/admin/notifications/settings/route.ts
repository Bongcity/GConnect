import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    // 설정이 없으면 기본값 생성
    let settings = await prisma.notificationSettings.findFirst();

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          syncFailureEnabled: true,
          paymentFailureEnabled: true,
          planExpiryEnabled: true,
          inquiryEnabled: true,
          emailEnabled: false,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Failed to fetch notification settings:', error);
    return NextResponse.json(
      { error: '알림 설정을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const body = await req.json();

    // 기존 설정 조회
    const existingSettings = await prisma.notificationSettings.findFirst();

    let settings;
    if (existingSettings) {
      // 업데이트
      settings = await prisma.notificationSettings.update({
        where: { id: existingSettings.id },
        data: {
          syncFailureEnabled: body.syncFailureEnabled,
          paymentFailureEnabled: body.paymentFailureEnabled,
          planExpiryEnabled: body.planExpiryEnabled,
          inquiryEnabled: body.inquiryEnabled,
          emailEnabled: body.emailEnabled,
          emailAddress: body.emailAddress,
          slackWebhook: body.slackWebhook,
          discordWebhook: body.discordWebhook,
        },
      });
    } else {
      // 생성
      settings = await prisma.notificationSettings.create({
        data: {
          syncFailureEnabled: body.syncFailureEnabled,
          paymentFailureEnabled: body.paymentFailureEnabled,
          planExpiryEnabled: body.planExpiryEnabled,
          inquiryEnabled: body.inquiryEnabled,
          emailEnabled: body.emailEnabled,
          emailAddress: body.emailAddress,
          slackWebhook: body.slackWebhook,
          discordWebhook: body.discordWebhook,
        },
      });
    }

    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error('Failed to save notification settings:', error);
    return NextResponse.json(
      { error: '알림 설정 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

