import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@gconnect/db';
import crypto from 'crypto';

// 암호화 키 (환경 변수로 관리해야 함)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'gconnect-default-encryption-key-32';
const ALGORITHM = 'aes-256-cbc';

// 암호화 함수
function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// 복호화 함수
function decrypt(text: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

// 네이버 API 설정 저장
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { naverClientId, naverClientSecret, naverApiEnabled } = body;

    // 필수 필드 검증
    if (!naverClientId || !naverClientSecret) {
      return NextResponse.json(
        { error: 'Client ID와 Client Secret은 필수입니다.' },
        { status: 400 }
      );
    }

    // Client Secret 암호화
    const encryptedSecret = encrypt(naverClientSecret);

    // 설정 저장
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        naverClientId: naverClientId.trim(),
        naverClientSecret: encryptedSecret,
        naverApiEnabled: naverApiEnabled || false,
      },
      select: {
        id: true,
        naverClientId: true,
        naverApiEnabled: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Save naver API settings error:', error);
    return NextResponse.json(
      { error: '네이버 API 설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 네이버 API 설정 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        naverClientId: true,
        naverClientSecret: true,
        naverApiEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Secret은 마스킹 처리
    const maskedSecret = user.naverClientSecret
      ? '••••••••••••••••'
      : '';

    return NextResponse.json({
      naverClientId: user.naverClientId || '',
      naverClientSecret: maskedSecret,
      naverApiEnabled: user.naverApiEnabled || false,
    });
  } catch (error) {
    console.error('Get naver API settings error:', error);
    return NextResponse.json(
      { error: '네이버 API 설정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 복호화된 Secret 가져오기 (내부 사용용)
export async function getDecryptedNaverApiKey(userId: string): Promise<{
  clientId: string;
  clientSecret: string;
} | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        naverClientId: true,
        naverClientSecret: true,
        naverApiEnabled: true,
      },
    });

    if (!user || !user.naverClientId || !user.naverClientSecret || !user.naverApiEnabled) {
      return null;
    }

    const decryptedSecret = decrypt(user.naverClientSecret);

    return {
      clientId: user.naverClientId,
      clientSecret: decryptedSecret,
    };
  } catch (error) {
    console.error('Get decrypted API key error:', error);
    return null;
  }
}

