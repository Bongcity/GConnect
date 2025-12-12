/**
 * product_description_url 필드 확인
 */

import { ddroPrisma } from '@gconnect/db';

async function main() {
  console.log('🔍 product_description_url 데이터 확인 중...\n');
  
  try {
    // product_description_url이 있는 상품 샘플 조회
    const samples = await ddroPrisma.$queryRaw<any[]>`
      SELECT TOP 10 
        id, 
        product_name, 
        product_description_url,
        LEN(product_description_url) as url_length
      FROM affiliate_products 
      WHERE product_description_url IS NOT NULL
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ product_description_url이 있는 상품 ${samples.length}개 발견\n`);
    
    samples.forEach((p, i) => {
      console.log(`${i + 1}. [ID: ${p.id}]`);
      console.log(`   상품명: ${p.product_name?.substring(0, 50)}...`);
      console.log(`   URL: ${p.product_description_url}`);
      console.log(`   URL 길이: ${p.url_length}자\n`);
    });
    
    // 통계
    const stats = await ddroPrisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as total,
        COUNT(product_description_url) as with_url,
        COUNT(*) - COUNT(product_description_url) as without_url
      FROM affiliate_products
    `;
    
    console.log('📊 통계:');
    console.log(`   전체 상품: ${stats[0].total}개`);
    console.log(`   URL 있음: ${stats[0].with_url}개`);
    console.log(`   URL 없음: ${stats[0].without_url}개`);
    
  } catch (error: any) {
    console.error('❌ 오류:', error.message);
  }
}

main()
  .catch((e) => {
    console.error('❌ 치명적 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await ddroPrisma.$disconnect();
  });









