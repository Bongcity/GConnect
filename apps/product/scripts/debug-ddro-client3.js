/**
 * DDRo Prisma Client 디버깅 v3 (JavaScript)
 */

// 직접 경로로 import
const { PrismaClient } = require('../../../node_modules/@prisma-ddro/client');

const client = new PrismaClient();

console.log('🔍 DDRo Prisma Client 분석...\n');
console.log('Client 객체 키들:');
const keys = Object.keys(client).filter(k => !k.startsWith('_') && !k.startsWith('$'));
keys.forEach(key => {
  console.log(`  - ${key}: ${typeof client[key]}`);
});

// GlobalProduct 확인
console.log('\nGlobalProduct 확인:');
console.log('  client.globalProduct:', typeof client.globalProduct);

async function test() {
  if (client.globalProduct) {
    try {
      const count = await client.globalProduct.count();
      console.log(`\n✅ GlobalProduct.count() 성공: ${count}개`);
      
      // 샘플 데이터 조회
      const products = await client.globalProduct.findMany({ take: 2 });
      console.log(`\n📦 샘플 상품:`);
      products.forEach((p, idx) => {
        console.log(`   ${idx + 1}. ${p.name}`);
      });
      
    } catch (error) {
      console.log(`\n❌ GlobalProduct.count() 실패: ${error.message}`);
    }
  } else {
    console.log('\n❌ globalProduct 모델이 존재하지 않습니다.');
  }
  
  await client.$disconnect();
}

test();

