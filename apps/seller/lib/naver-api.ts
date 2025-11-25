import { prisma } from '@gconnect/db';
import crypto from 'crypto';

// ?뷀샇????(?섍꼍 蹂?섎줈 愿由ы빐????
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'gconnect-default-encryption-key-32';
const ALGORITHM = 'aes-256-cbc';

// ?뷀샇???⑥닔
export function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// 蹂듯샇???⑥닔
export function decrypt(text: string): string {
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

// 蹂듯샇?붾맂 Secret 媛?몄삤湲?(?대? ?ъ슜??
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

// ?ㅼ씠踰?API ?대씪?댁뼵??(湲곕낯 export)
export default class NaverApiClient {
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getProducts() {
    // ?ㅼ씠踰?而ㅻ㉧??API ?몄텧 濡쒖쭅
    // ?ㅼ젣 援ы쁽 ?꾩슂
    return [];
  }

  async getProductDetail(productId: string) {
    // ?곹뭹 ?곸꽭 ?뺣낫 議고쉶
    return null;
  }

  async getAllProducts(maxPages: number = 3) {
    // ?ㅼ씠踰?而ㅻ㉧??API濡??곹뭹 紐⑸줉 議고쉶
    // ?ㅼ젣 援ы쁽 ?꾩슂
    return [];
  }

  transformNaverProduct(naverProduct: any) {
    // ?ㅼ씠踰??곹뭹 ?곗씠?곕? GConnect ?뺤떇?쇰줈 蹂??
    return {
      name: naverProduct.name || '',
      description: naverProduct.description || '',
      price: naverProduct.price || 0,
      salePrice: naverProduct.salePrice || naverProduct.price || 0,
      stockQuantity: naverProduct.stockQuantity || 0,
      category1: naverProduct.category1 || '',
      category2: naverProduct.category2 || '',
      category3: naverProduct.category3 || '',
      imageUrl: naverProduct.imageUrl || '',
      naverProductId: naverProduct.id || '',
    };
  }
}

// ?낅┰ ?⑥닔濡쒕룄 ?ъ슜 媛??
export function transformNaverProduct(naverProduct: any) {
  return {
    name: naverProduct.name || '',
    description: naverProduct.description || '',
    price: naverProduct.price || 0,
    salePrice: naverProduct.salePrice || naverProduct.price || 0,
    stockQuantity: naverProduct.stockQuantity || 0,
    category1: naverProduct.category1 || '',
    category2: naverProduct.category2 || '',
    category3: naverProduct.category3 || '',
    imageUrl: naverProduct.imageUrl || '',
    naverProductId: naverProduct.id || '',
  };
}
