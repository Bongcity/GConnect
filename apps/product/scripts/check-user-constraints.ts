/**
 * Users 테이블의 제약조건 확인 스크립트
 */

import { PrismaClient } from '@gconnect/db';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Users 테이블 제약조건 확인 중...\n');

  // 1. 테이블 구조 확인
  const columns: any[] = await prisma.$queryRaw`
    SELECT 
      COLUMN_NAME,
      DATA_TYPE,
      IS_NULLABLE,
      CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Users'
    ORDER BY ORDINAL_POSITION
  `;

  console.log('📋 Users 테이블 컬럼:');
  columns.forEach(col => {
    console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'required'})`);
  });

  // 2. Unique 제약조건 확인
  const constraints: any[] = await prisma.$queryRaw`
    SELECT 
      i.name AS index_name,
      i.is_unique,
      COL_NAME(ic.object_id, ic.column_id) AS column_name
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    WHERE i.object_id = OBJECT_ID('dbo.Users')
      AND i.is_unique = 1
    ORDER BY i.name, ic.key_ordinal
  `;

  console.log('\n🔒 Unique 제약조건:');
  constraints.forEach(c => {
    console.log(`   - ${c.index_name}: ${c.column_name}`);
  });

  // 3. 현재 Users 데이터 확인
  const users: any[] = await prisma.$queryRaw`
    SELECT id, email, naverUserId, shopName, naverShopId
    FROM Users
  `;

  console.log(`\n👥 현재 Users 테이블 데이터 (총 ${users.length}명):`);
  users.forEach(u => {
    console.log(`   - ${u.email} (shopName: ${u.shopName}, naverShopId: ${u.naverShopId})`);
  });

  console.log('\n✅ 확인 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

