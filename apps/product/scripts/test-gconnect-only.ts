/**
 * GCONNECT DB 단독 연결 테스트
 */

import { prisma } from '@gconnect/db';

async function main() {
  console.log('🔍 GCONNECT DB 연결 테스트 시작...\n');
  
  console.log('연결 정보:');
  console.log('- 서버: 211.195.9.70,14103');
  console.log('- DB: GCONNECT');
  console.log('- USER: gconnect_admini\n');
  
  console.log('환경 변수:');
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL.replace(/password=[^;]+/, 'password=***');
    console.log(`DATABASE_URL: ${dbUrl}\n`);
  } else {
    console.log('❌ DATABASE_URL이 설정되지 않았습니다!\n');
    process.exit(1);
  }
  
  try {
    console.log('1️⃣ SELECT 1 테스트...');
    const result = await prisma.$queryRaw<{ result: number }[]>`SELECT 1 as result`;
    console.log('✅ SELECT 1 성공:', result);
    
    console.log('\n2️⃣ 데이터베이스 버전 확인...');
    const version = await prisma.$queryRaw<{ version: string }[]>`SELECT @@VERSION as version`;
    console.log('✅ DB 버전:', version[0]?.version?.substring(0, 100) + '...');
    
    console.log('\n3️⃣ Product 테이블 확인...');
    const count = await prisma.product.count();
    console.log(`✅ Product 테이블: ${count}개 상품 존재`);
    
    console.log('\n🎉 GCONNECT DB 연결 완전 성공!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ 연결 실패:', error.message);
    console.error('\n전체 오류:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ 치명적 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


