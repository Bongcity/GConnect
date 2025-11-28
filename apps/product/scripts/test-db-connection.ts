/**
 * 데이터베이스 연결 테스트 스크립트
 * 
 * GCONNECT DB와 DDRo DB에 직접 연결을 시도하여 문제를 진단합니다.
 */

import { PrismaClient } from '@gconnect/db';
import { PrismaClient as DDRoPrismaClient } from '@gconnect/db';

async function testGConnectDB() {
  console.log('\n🔍 GCONNECT DB 연결 테스트...');
  console.log('-----------------------------------');
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  
  try {
    console.log('⏳ 연결 시도 중...');
    
    // 간단한 쿼리로 연결 테스트
    const result = await prisma.$queryRaw`SELECT 1 AS test`;
    
    console.log('✅ GCONNECT DB 연결 성공!');
    console.log('   테스트 쿼리 결과:', result);
    
    // 실제 데이터 조회 테스트
    const userCount = await prisma.user.count();
    console.log(`   📊 등록된 사용자 수: ${userCount}`);
    
    const productCount = await prisma.product.count();
    console.log(`   📦 등록된 상품 수: ${productCount}`);
    
    return true;
  } catch (error: any) {
    console.error('❌ GCONNECT DB 연결 실패!');
    console.error('   오류 메시지:', error.message);
    console.error('   오류 코드:', error.code);
    
    if (error.message.includes('Timed out')) {
      console.error('\n   💡 타임아웃 발생: 네트워크/방화벽 문제일 가능성이 높습니다.');
      console.error('   - 서버 IP: 211.195.9.70');
      console.error('   - 포트: 14103');
      console.error('   - 방화벽에서 해당 IP:PORT가 허용되어 있는지 확인하세요.');
    } else if (error.message.includes('Login failed')) {
      console.error('\n   💡 로그인 실패: 자격 증명 문제입니다.');
      console.error('   - 사용자: gconnect_admini');
      console.error('   - 비밀번호 확인 필요');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function testDDRoDB() {
  console.log('\n🔍 DDRo DB 연결 테스트...');
  console.log('-----------------------------------');
  
  const ddroPrisma = new DDRoPrismaClient({
    log: ['query', 'error', 'warn'],
  });
  
  try {
    console.log('⏳ 연결 시도 중...');
    
    // 간단한 쿼리로 연결 테스트
    const result = await ddroPrisma.$queryRaw`SELECT 1 AS test`;
    
    console.log('✅ DDRo DB 연결 성공!');
    console.log('   테스트 쿼리 결과:', result);
    
    // 실제 데이터 조회 테스트
    const productCount = await ddroPrisma.affiliateProduct.count();
    console.log(`   📦 등록된 상품 수: ${productCount}`);
    
    return true;
  } catch (error: any) {
    console.error('❌ DDRo DB 연결 실패!');
    console.error('   오류 메시지:', error.message);
    console.error('   오류 코드:', error.code);
    
    if (error.message.includes('Timed out')) {
      console.error('\n   💡 타임아웃 발생: 네트워크/방화벽 문제일 가능성이 높습니다.');
      console.error('   - 서버 IP: 59.23.231.197');
      console.error('   - 포트: 14103');
      console.error('   - 방화벽에서 해당 IP:PORT가 허용되어 있는지 확인하세요.');
    } else if (error.message.includes('Login failed')) {
      console.error('\n   💡 로그인 실패: 자격 증명 문제입니다.');
      console.error('   - 사용자: 1stplatfor_sql');
      console.error('   - 비밀번호 확인 필요');
    }
    
    return false;
  } finally {
    await ddroPrisma.$disconnect();
  }
}

async function main() {
  console.log('═══════════════════════════════════');
  console.log('  데이터베이스 연결 진단 도구');
  console.log('═══════════════════════════════════');
  
  const gconnectOk = await testGConnectDB();
  const ddroOk = await testDDRoDB();
  
  console.log('\n═══════════════════════════════════');
  console.log('  진단 결과 요약');
  console.log('═══════════════════════════════════');
  console.log(`GCONNECT DB: ${gconnectOk ? '✅ 정상' : '❌ 연결 실패'}`);
  console.log(`DDRo DB:     ${ddroOk ? '✅ 정상' : '❌ 연결 실패'}`);
  console.log('═══════════════════════════════════\n');
  
  if (!gconnectOk || !ddroOk) {
    console.log('⚠️  일부 데이터베이스 연결에 문제가 있습니다.');
    console.log('   네트워크 관리자에게 문의하여 방화벽 설정을 확인하세요.');
    process.exit(1);
  } else {
    console.log('🎉 모든 데이터베이스 연결이 정상입니다!');
    process.exit(0);
  }
}

main()
  .catch((e) => {
    console.error('❌ 예상치 못한 오류 발생:', e);
    process.exit(1);
  });

