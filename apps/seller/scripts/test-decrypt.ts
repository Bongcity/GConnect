/**
 * 암호화된 Client Secret 복호화 테스트
 * 사용법: npx tsx scripts/test-decrypt.ts
 */

import { decrypt } from '../lib/crypto';

// DB에서 가져온 암호화된 값
const encryptedSecret = '76d3ba80584cad2c53ae'; // 여기에 전체 값 입력 필요

console.log('🔐 암호화된 값:', encryptedSecret);
console.log('📏 길이:', encryptedSecret.length);

try {
  const decrypted = decrypt(encryptedSecret);
  console.log('✅ 복호화 성공!');
  console.log('🔓 복호화된 값:', decrypted);
  console.log('📏 복호화된 길이:', decrypted.length);
  
  // 예상되는 값과 비교
  const expectedSecret = '$2a$04$ZoPOOucB6lo1HxspiMs5be';
  if (decrypted === expectedSecret) {
    console.log('✅ 올바른 값입니다!');
  } else {
    console.log('❌ 예상 값과 다릅니다!');
    console.log('   예상:', expectedSecret);
    console.log('   실제:', decrypted);
  }
} catch (error) {
  console.error('❌ 복호화 실패:', error);
}

