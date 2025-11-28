/**
 * DB 연결 간단 테스트
 * 
 * GCONNECT DB와 DDRo DB에 실제로 연결할 수 있는지 확인
 */

import { prisma, ddroPrisma } from '@gconnect/db';

async function testGConnectDB() {
  console.log('\n🔍 GCONNECT DB 연결 테스트...');
  try {
    const result = await prisma.$queryRaw<{ result: number }[]>`SELECT 1 as result`;
    console.log('✅ GCONNECT DB 연결 성공!', result);
    
    // Product 테이블 존재 확인
    const productCount = await prisma.product.count();
    console.log(`📊 Product 테이블: ${productCount}개 상품`);
    
    return true;
  } catch (error: any) {
    console.error('❌ GCONNECT DB 연결 실패:', error.message);
    return false;
  }
}

async function testDDRoDB() {
  console.log('\n🔍 DDRo DB 연결 테스트...');
  try {
    const result = await ddroPrisma.$queryRaw<{ result: number }[]>`SELECT 1 as result`;
    console.log('✅ DDRo DB 연결 성공!', result);
    
    // 전체 상품 수
    const totalResult = await ddroPrisma.$queryRaw<{ total: number }[]>`SELECT COUNT(*) as total FROM affiliate_products`;
    console.log(`📊 전체 상품 수: ${totalResult[0].total}개`);
    
    // enabled=1 상품 수
    const enabledResult = await ddroPrisma.$queryRaw<{ total: number }[]>`SELECT COUNT(*) as total FROM affiliate_products WHERE enabled = 1`;
    console.log(`   ✅ enabled=1: ${enabledResult[0].total}개`);
    
    // enabled=0 상품 수
    const disabledResult = await ddroPrisma.$queryRaw<{ total: number }[]>`SELECT COUNT(*) as total FROM affiliate_products WHERE enabled = 0`;
    console.log(`   ❌ enabled=0: ${disabledResult[0].total}개`);
    
    // enabled=NULL 상품 수
    const nullResult = await ddroPrisma.$queryRaw<{ total: number }[]>`SELECT COUNT(*) as total FROM affiliate_products WHERE enabled IS NULL`;
    console.log(`   ❓ enabled=NULL: ${nullResult[0].total}개`);
    
    // 최근 상품 샘플
    console.log('\n📦 최근 상품 샘플 (5개):');
    const samples = await ddroPrisma.$queryRaw<any[]>`
      SELECT TOP 5 id, product_name, sale_price, enabled, created_at 
      FROM affiliate_products 
      ORDER BY created_at DESC
    `;
    samples.forEach((p, i) => {
      const name = p.product_name ? p.product_name.substring(0, 30) : '(이름없음)';
      console.log(`   ${i+1}. [${p.id}] ${name}... (${p.sale_price}원, enabled=${p.enabled})`);
    });
    
    return true;
  } catch (error: any) {
    console.error('❌ DDRo DB 연결 실패:', error.message);
    console.error('   상세:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 DB 연결 테스트 시작\n');
  console.log('환경 변수:');
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ 로드됨' : '❌ 없음');
  console.log('- DDRO_DATABASE_URL:', process.env.DDRO_DATABASE_URL ? '✅ 로드됨' : '❌ 없음');
  
  // 디버깅: 연결 문자열 형식 확인 (비밀번호는 숨김)
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL.replace(/password=[^;]+/, 'password=***');
    console.log('  DATABASE_URL 형식:', dbUrl);
  }
  if (process.env.DDRO_DATABASE_URL) {
    const ddroUrl = process.env.DDRO_DATABASE_URL.replace(/password=[^;]+/, 'password=***');
    console.log('  DDRO_DATABASE_URL 형식:', ddroUrl);
  }
  
  const gconnectOk = await testGConnectDB();
  const ddroOk = await testDDRoDB();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 테스트 결과 요약:');
  console.log(`   GCONNECT DB: ${gconnectOk ? '✅ 성공' : '❌ 실패'}`);
  console.log(`   DDRo DB: ${ddroOk ? '✅ 성공' : '❌ 실패'}`);
  console.log('='.repeat(50));
  
  if (!gconnectOk || !ddroOk) {
    console.log('\n⚠️  DB 연결 문제 해결 방법:');
    console.log('1. 네트워크/방화벽 확인');
    console.log('2. DB 서버 상태 확인');
    console.log('3. 연결 문자열 확인 (.env.local)');
    console.log('4. DB 접근 권한 확인');
  }
}

main()
  .catch((e) => {
    console.error('❌ 치명적 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await ddroPrisma.$disconnect();
  });

