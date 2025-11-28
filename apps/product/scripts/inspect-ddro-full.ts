/**
 * DDRo DB 전체 구조 분석
 * - affiliate_products
 * - NaverCategories
 * - NaverCollectionProgress
 * - NaverShoppingKeywords
 */

import { PrismaClient } from '@gconnect/db';

async function inspectTable(prisma: PrismaClient, tableName: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 테이블: ${tableName}`);
  console.log('='.repeat(60));
  
  try {
    // 테이블 구조 조회
    const columns: any[] = await prisma.$queryRaw`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        CHARACTER_MAXIMUM_LENGTH,
        COLUMN_DEFAULT,
        ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = ${tableName}
      ORDER BY ORDINAL_POSITION
    `;
    
    if (columns.length === 0) {
      console.log(`❌ 테이블 '${tableName}'을(를) 찾을 수 없습니다.`);
      return null;
    }
    
    console.log(`\n컬럼 수: ${columns.length}개\n`);
    
    columns.forEach((col) => {
      const nullable = col.IS_NULLABLE === 'YES' ? '?' : '';
      const length = col.CHARACTER_MAXIMUM_LENGTH && col.CHARACTER_MAXIMUM_LENGTH > 0 
        ? `(${col.CHARACTER_MAXIMUM_LENGTH})` 
        : col.CHARACTER_MAXIMUM_LENGTH === -1 ? '(MAX)' : '';
      const defaultVal = col.COLUMN_DEFAULT ? ` = ${col.COLUMN_DEFAULT}` : '';
      
      console.log(`${col.ORDINAL_POSITION.toString().padStart(3)}. ${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE}${length}${nullable}${defaultVal}`);
    });
    
    // 데이터 건수
    const countResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM [dbo].[${tableName}]
    `;
    console.log(`\n📊 총 레코드 수: ${countResult[0]?.count || 0}개`);
    
    // 샘플 데이터 (첫 1개만)
    if (countResult[0]?.count > 0) {
      const sample: any[] = await prisma.$queryRaw`
        SELECT TOP 1 * FROM [dbo].[${tableName}]
      `;
      console.log(`\n📦 샘플 데이터 (1개):`);
      console.log(JSON.stringify(sample[0], null, 2));
    }
    
    return columns;
    
  } catch (error: any) {
    console.error(`❌ 오류: ${error.message}`);
    return null;
  }
}

async function main() {
  // DDRo DB에 연결
  const ddroConnectionString = "sqlserver://59.23.231.197,14103;database=DDRo;user=1stplatfor_sql;password=%40allin%23am1071;encrypt=false;trustServerCertificate=true";
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: ddroConnectionString,
      },
    },
  });
  
  console.log('🔍 DDRo DB 전체 구조 분석 시작...');
  console.log(`📡 서버: 59.23.231.197:14103`);
  console.log(`🗄️  DB: DDRo\n`);
  
  // 주요 테이블 분석
  const tables = [
    'affiliate_products',
    'NaverCategories',
    'NaverCollectionProgress',
    'NaverShoppingKeywords',
  ];
  
  for (const table of tables) {
    await inspectTable(prisma, table);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ DDRo DB 분석 완료!');
  console.log('='.repeat(60));
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ 예상치 못한 오류:', e);
  process.exit(1);
});

