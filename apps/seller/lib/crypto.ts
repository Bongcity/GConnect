import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'gconnect-default-encryption-key-32';
const ALGORITHM = 'aes-256-cbc';

export function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  try {
    // 빈 문자열이나 유효하지 않은 형식 체크
    if (!text || typeof text !== 'string' || !text.includes(':')) {
      console.error('Invalid encrypted text format');
      return '';
    }

    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
    const parts = text.split(':');
    
    if (parts.length !== 2) {
      console.error('Invalid encrypted text structure');
      return '';
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error: any) {
    console.error('Decryption error:', error.message);
    // ByteString 에러 등 복호화 실패 시 빈 문자열 반환
    return '';
  }
}

