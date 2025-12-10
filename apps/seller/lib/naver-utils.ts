import { prisma } from '@gconnect/db';
import { decrypt } from './crypto';

export async function getDecryptedNaverApiKey(userId: string): Promise<{
  clientId: string;
  clientSecret: string;
} | null> {
  try {
    const user = await prisma.user.findUnique({
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

    // 🔍 디버깅: 복호화된 값 확인
    console.log('🔐 암호화된 값:', user.naverClientSecret.substring(0, 50) + '...');
    console.log('🔓 복호화된 값:', decryptedSecret ? decryptedSecret.substring(0, 20) + '...' : '(empty)');
    console.log('📏 복호화된 길이:', decryptedSecret?.length);
    console.log('🎯 예상값 시작:', '$2a$04$ZoPOOucB6lo1HxspiMs5be');
    console.log('✅ 일치 여부:', decryptedSecret === '$2a$04$ZoPOOucB6lo1HxspiMs5be');

    // 복호화 실패 시 (잘못된 암호화 값)
    if (!decryptedSecret || decryptedSecret.trim() === '') {
      console.error('❌ Failed to decrypt naver client secret');
      return null;
    }

    return {
      clientId: user.naverClientId,
      clientSecret: decryptedSecret,
    };
  } catch (error) {
    console.error('Get decrypted API key error:', error);
    return null;
  }
}

