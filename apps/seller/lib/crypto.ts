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
    // 빈 문자열 체크
    if (!text || typeof text !== 'string') {
      console.error('Invalid encrypted text: empty or not a string');
      return '';
    }

    // 암호화된 형식이 아닌 경우 (콜론이 없음)
    if (!text.includes(':')) {
      console.error('Invalid encrypted text format: no delimiter found');
      return '';
    }

    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
    const parts = text.split(':');
    
    if (parts.length !== 2) {
      console.error('Invalid encrypted text structure: wrong number of parts');
      return '';
    }

    // hex 문자열 유효성 검사
    const hexPattern = /^[0-9a-fA-F]+$/;
    if (!hexPattern.test(parts[0]) || !hexPattern.test(parts[1])) {
      console.error('Invalid encrypted text: not valid hex format');
      return '';
    }

    // IV와 암호화된 텍스트의 길이 검증
    if (parts[0].length !== 32) { // IV should be 16 bytes = 32 hex chars
      console.error('Invalid IV length');
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
    console.error('Input text:', text ? text.substring(0, 50) + '...' : 'empty');
    // ByteString 에러 등 복호화 실패 시 빈 문자열 반환
    return '';
  }
}

