/**
 * DDRo DB 구조 확인 (READ-ONLY)
 * DDRo DB는 수정하지 않고, 구조만 확인합니다.
 */

import { PrismaClient } from '@gconnect/db';

async function inspectTable(prisma: PrismaClient, tableName: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 ${tableName}`);
  console.log('='.repeat(70));
  
  try {
    const columns: any[] = await prisma.$queryRaw`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE,
        COLUMN_DEFAULT,
        ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = ${tableName}
      ORDER BY ORDINAL_POSITION
    `;
    
    if (columns.length === 0) {
      console.log(`❌ 테이블을 찾을 수 없습니다.`);
      return;
    }
    
    console.log(`\n총 ${columns.length}개 컬럼:\n`);
    
    columns.forEach((col) => {
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
      let dataType = col.DATA_TYPE;
      
      if (col.CHARACTER_MAXIMUM_LENGTH && col.CHARACTER_MAXIMUM_LENGTH > 0) {
        dataType += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
      } else if (col.CHARACTER_MAXIMUM_LENGTH === -1) {
        dataType += '(MAX)';
      } else if (col.DATA_TYPE === 'decimal' && col.NUMERIC_PRECISION) {
        dataType += `(${col.NUMERIC_PRECISION},${col.NUMERIC_SCALE})`;
      }
      
      const defaultVal = col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
      
      console.log(`  ${col.COLUMN_NAME.padEnd(30)} ${dataType.padEnd(20)} ${nullable}${defaultVal}`);
    });
    
    const countResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM [dbo].[${tableName}]
    `;
    console.log(`\n📊 레코드 수: ${countResult[0]?.count || 0}개`);
    
  } catch (error: any) {
    console.error(`❌ 오류: ${error.message}`);
  }
}

async function main() {
  const ddroUrl = "sqlserver://59.23.231.197,14103;database=DDRo;user=1stplatfor_sql;password=%40allin%23am1071;encrypt=false;trustServerCertificate=true";
  
  const prisma = new PrismaClient({
    datasources: { db: { url: ddroUrl } },
  });
  
  console.log('🔍 DDRo DB 구조 확인 (READ-ONLY)');
  console.log('📡 서버: 59.23.231.197:14103');
  console.log('🗄️  DB: DDRo');
  console.log('⚠️  이 스크립트는 데이터를 읽기만 하고 수정하지 않습니다.');
  
  const tables = [
    'affiliate_products',
    'NaverCategories', 
    'NaverCollectionProgress',
    'NaverShoppingKeywords'
  ];
  
  for (const table of tables) {
    await inspectTable(prisma, table);
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('✅ 분석 완료');
  console.log('='.repeat(70));
  
  await prisma.$disconnect();
}

main().catch(console.error);

