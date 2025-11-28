/**
 * GlobalProduct 모델 테스트
 */

import { ddroPrisma } from '@gconnect/db';

async function main() {
  console.log('🔍 GlobalProduct 모델 테스트...\n');
  
  try {
    const count = await ddroPrisma.globalProduct.count();
    console.log(`✅ GlobalProduct 모델 작동 확인!`);
    console.log(`   총 상품 수: ${count}`);
    
    if (count > 0) {
      const products = await ddroPrisma.globalProduct.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      });
      
      console.log(`\n📦 최근 상품 ${products.length}개:`);
      products.forEach((product, idx) => {
        console.log(`   ${idx + 1}. ${product.name}`);
        console.log(`      가격: ${product.price}원 ${product.salePrice ? `→ ${product.salePrice}원` : ''}`);
        console.log(`      카테고리: ${product.category1} > ${product.category2}`);
      });
    }
    
  } catch (error: any) {
    console.error('❌ 오류:', error.message);
  } finally {
    await ddroPrisma.$disconnect();
  }
}

main();

