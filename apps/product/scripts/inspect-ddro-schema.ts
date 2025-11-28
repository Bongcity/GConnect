/**
 * DDRo DB 스키마 검사 스크립트
 * 실제 테이블 목록과 구조를 확인합니다.
 */

import { PrismaClient as DDRoPrismaClient } from '@gconnect/db';

async function main() {
  const ddroPrisma = new DDRoPrismaClient({
    log: ['query'],
  });
  
  try {
    console.log('🔍 DDRo DB 스키마 검사 중...\n');
    
    // 1. 모든 테이블 목록 조회
    console.log('📋 데이터베이스의 모든 테이블:');
    const tables = await ddroPrisma.$queryRaw<any[]>`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME
    `;
    
    tables.forEach((table, idx) => {
      console.log(`   ${idx + 1}. ${table.TABLE_NAME}`);
    });
    
    // 2. affiliate_products 테이블 존재 여부 확인
    console.log('\n🔍 affiliate_products 테이블 검색...');
    const affiliateTable = tables.find(t => 
      t.TABLE_NAME.toLowerCase().includes('affiliate') || 
      t.TABLE_NAME.toLowerCase().includes('product')
    );
    
    if (affiliateTable) {
      console.log(`✅ 발견: ${affiliateTable.TABLE_NAME}`);
      
      // 테이블 구조 조회
      console.log(`\n📊 ${affiliateTable.TABLE_NAME} 테이블 구조:`);
      const columns = await ddroPrisma.$queryRaw<any[]>`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = ${affiliateTable.TABLE_NAME}
        ORDER BY ORDINAL_POSITION
      `;
      
      columns.forEach((col) => {
        const nullable = col.IS_NULLABLE === 'YES' ? '?' : '';
        const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
        console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length}${nullable}`);
      });
      
      // 데이터 건수 확인
      const count = await ddroPrisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM ${affiliateTable.TABLE_NAME}
      `;
      console.log(`\n   📦 총 레코드 수: ${count[0].count}`);
      
    } else {
      console.log('❌ affiliate 또는 product 관련 테이블을 찾을 수 없습니다.');
    }
    
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await ddroPrisma.$disconnect();
  }
}

main();

