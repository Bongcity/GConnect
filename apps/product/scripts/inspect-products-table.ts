/**
 * DDRo DB의 Products 테이블 구조 확인
 */

import { PrismaClient as DDRoPrismaClient } from '@gconnect/db';

async function main() {
  const ddroPrisma = new DDRoPrismaClient();
  
  try {
    console.log('🔍 Products 테이블 구조 분석 중...\n');
    
    // 테이블 구조 조회
    const columns = await ddroPrisma.$queryRaw<any[]>`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        CHARACTER_MAXIMUM_LENGTH,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Products'
      ORDER BY ORDINAL_POSITION
    `;
    
    console.log('📊 Products 테이블 컬럼:');
    console.log('-----------------------------------');
    columns.forEach((col) => {
      const nullable = col.IS_NULLABLE === 'YES' ? ' (nullable)' : ' (required)';
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      const defaultVal = col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
      console.log(`${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE}${length}${nullable}${defaultVal}`);
    });
    
    // 데이터 건수 확인
    const countResult = await ddroPrisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM [dbo].[Products]
    `;
    console.log(`\n📦 총 상품 수: ${countResult[0].count}`);
    
    // 샘플 데이터 조회
    if (countResult[0].count > 0) {
      console.log('\n📋 샘플 데이터 (최대 3개):');
      const samples = await ddroPrisma.$queryRaw<any[]>`
        SELECT TOP 3 * FROM [dbo].[Products]
      `;
      console.log(JSON.stringify(samples, null, 2));
    }
    
  } catch (error: any) {
    console.error('❌ 오류:', error.message);
  } finally {
    await ddroPrisma.$disconnect();
  }
}

main();

