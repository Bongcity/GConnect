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

    // 복호화 실패 시 (잘못된 암호화 값)
    if (!decryptedSecret || decryptedSecret.trim() === '') {
      console.error('Failed to decrypt naver client secret');
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

