/**
 * DDRo Prisma Client 디버깅 v2
 */

// 직접 경로로 import
const { PrismaClient } = require('../../../node_modules/@prisma-ddro/client');

const client = new PrismaClient();

console.log('🔍 DDRo Prisma Client 분석...\n');
console.log('Client 객체 키들:');
const keys = Object.keys(client).filter(k => !k.startsWith('_') && !k.startsWith('$'));
keys.forEach(key => {
  console.log(`  - ${key}: ${typeof (client as any)[key]}`);
});

// GlobalProduct 확인
console.log('\nGlobalProduct 확인:');
console.log('  client.globalProduct:', typeof (client as any).globalProduct);

async function test() {
  if ((client as any).globalProduct) {
    try {
      const count = await (client as any).globalProduct.count();
      console.log(`\n✅ GlobalProduct.count() 성공: ${count}개`);
    } catch (error: any) {
      console.log(`\n❌ GlobalProduct.count() 실패: ${error.message}`);
    }
  } else {
    console.log('\n❌ globalProduct 모델이 존재하지 않습니다.');
  }
  
  await client.$disconnect();
}

test();

