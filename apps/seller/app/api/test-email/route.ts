import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail, generateSyncSuccessEmail } from '@/lib/email';

// 테스트 이메일 발송
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('📧 테스트 이메일 발송 시작...');
    console.log('📨 수신자:', email);
    console.log('🔑 API Key:', process.env.RESEND_API_KEY ? '설정됨 ✅' : '없음 ❌');
    console.log('📤 발신자:', process.env.EMAIL_FROM || 'GConnect <noreply@resend.dev>');

    const html = generateSyncSuccessEmail({
      shopName: session.user.name || '테스트 샵',
      itemsTotal: 10,
      itemsSynced: 10,
      itemsFailed: 0,
      duration: 2500,
    });

    const result = await sendEmail({
      to: email,
      subject: '[GConnect] 테스트 이메일 ✅',
      html,
    });

    console.log('📧 발송 결과:', result);

    if (result.success) {
      return NextResponse.json({
        ok: true,
        message: '이메일이 성공적으로 발송되었습니다.',
        data: result.data,
      });
    } else {
      return NextResponse.json({
        ok: false,
        message: '이메일 발송에 실패했습니다.',
        error: result.message,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ 테스트 이메일 발송 오류:', error);
    return NextResponse.json(
      { error: error.message || '이메일 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

