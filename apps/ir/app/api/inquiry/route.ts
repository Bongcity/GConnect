import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@gconnect/db';
import { irInquirySchema } from '@gconnect/lib/validations';
import { ZodError } from 'zod';

/**
 * 관리자 알림 생성 (Admin 앱의 알림 로직)
 */
async function createAdminNotification(inquiryId: number) {
  try {
    const inquiry = await prisma.iRInquiry.findUnique({
      where: { id: inquiryId },
      select: {
        storeName: true,
        email: true,
        inquiryType: true,
        planIntent: true,
      },
    });

    if (!inquiry) return;

    // 알림 설정 확인
    const settings = await prisma.notificationSettings.findFirst();
    if (settings && !settings.inquiryEnabled) {
      console.log('문의 알림이 비활성화되어 있습니다.');
      return;
    }

    // 알림 생성
    await prisma.adminNotification.create({
      data: {
        type: 'INQUIRY',
        title: '신규 문의 접수',
        message: `${inquiry.storeName}(${inquiry.email})에서 ${inquiry.inquiryType} 문의가 접수되었습니다. 플랜 의도: ${inquiry.planIntent || '미정'}`,
        severity: 'INFO',
        link: '/dashboard/support/inquiries',
        metadata: JSON.stringify({ inquiryId }),
      },
    });

    console.log(`✅ 신규 문의 알림 생성: ${inquiryId}`);
  } catch (error) {
    console.error('알림 생성 실패:', error);
  }
}

/**
 * IR 문의 접수 API
 * POST /api/inquiry
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();

    // 유효성 검사
    const validated = irInquirySchema.parse(body);

    // User-Agent와 Referrer 추출
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

    // 데이터베이스에 저장
    const inquiry = await prisma.iRInquiry.create({
      data: {
        storeName: validated.storeName,
        email: validated.email,
        phone: validated.phone || null,
        planIntent: validated.planIntent || null,
        inquiryType: validated.inquiryType,
        message: validated.message,
        pageUrl: validated.pageUrl || null,
        userAgent: userAgent || null,
        referrer: referrer || null,
        isHandled: false,
      },
    });

    // 관리자 알림 생성 (비동기, 실패해도 문의 접수는 성공)
    createAdminNotification(inquiry.id).catch((err) =>
      console.error('알림 생성 중 오류:', err)
    );

    // 성공 응답
    return NextResponse.json(
      {
        ok: true,
        data: {
          id: inquiry.id,
          message: '문의가 성공적으로 접수되었습니다.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /inquiry] Error:', error);

    // Zod 유효성 검사 오류
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        {
          ok: false,
          error: firstError.message || '입력값이 올바르지 않습니다.',
          errorCode: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Prisma 오류
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
      return NextResponse.json(
        {
          ok: false,
          error: '데이터베이스 오류가 발생했습니다.',
          errorCode: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }

    // 기타 오류
    return NextResponse.json(
      {
        ok: false,
        error: '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        errorCode: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// OPTIONS 메서드 (CORS 대응)
export async function OPTIONS() {
  return NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

