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

    return {
      clientId: user.naverClientId,
      clientSecret: decryptedSecret,
    };
  } catch (error) {
    console.error('Get decrypted API key error:', error);
    return null;
  }
}

