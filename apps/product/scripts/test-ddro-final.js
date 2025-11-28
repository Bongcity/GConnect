const { PrismaClient } = require('../../node_modules/@prisma-ddro/client');

async function main() {
  const client = new PrismaClient();
  
  console.log('🔍 DDRo Prisma Client 분석...\n');
  
  const keys = Object.keys(client).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  console.log('📋 사용 가능한 모델:', keys.join(', '));
  
  if (client.globalProduct) {
    console.log('\n✅ globalProduct 모델 발견!');
    
    try {
      const count = await client.globalProduct.count();
      console.log(`   총 상품 수: ${count}개`);
      
      if (count > 0) {
        const products = await client.globalProduct.findMany({ take: 3 });
        console.log(`\n📦 샘플 상품:`);
        products.forEach((p, idx) => {
          console.log(`   ${idx + 1}. ${p.name}`);
          console.log(`      카테고리: ${p.category1} > ${p.category2}`);
        });
      }
    } catch (error) {
      console.log(`\n❌ 쿼리 실패: ${error.message}`);
    }
  } else {
    console.log('\n❌ globalProduct 모델을 찾을 수 없습니다.');
  }
  
  await client.$disconnect();
}

main();

