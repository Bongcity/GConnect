/**
 * DDRo Prisma Client 디버깅
 */

import { PrismaClient as PrismaClientDDRo } from '@prisma-ddro/client';

const client = new PrismaClientDDRo();

console.log('🔍 DDRo Prisma Client 분석...\n');
console.log('Client 객체 타입:', typeof client);
console.log('Client 객체 keys:', Object.keys(client).filter(k => !k.startsWith('_') && !k.startsWith('$')));
console.log('Model keys:', Object.keys(client).filter(k => !k.startsWith('_') && !k.startsWith('$') && typeof (client as any)[k] === 'object'));

// GlobalProduct 확인
console.log('\nGlobalProduct 확인:');
console.log('  client.globalProduct:', typeof (client as any).globalProduct);

// 다른 가능한 이름들 확인
const possibleNames = ['GlobalProduct', 'globalProduct', 'products', 'Products', 'product', 'Product'];
console.log('\n가능한 모델 이름 체크:');
possibleNames.forEach(name => {
  const exists = (client as any)[name] !== undefined;
  console.log(`  client.${name}: ${exists ? '✅ 존재' : '❌ 없음'}`);
});

