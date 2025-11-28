/**
 * Products 테이블 확인 스크립트
 */

import { PrismaClient } from '@gconnect/db';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Products 테이블 확인 중...\n');

  // 1. 테이블 구조 확인
  const columns: any[] = await prisma.$queryRaw`
    SELECT 
      COLUMN_NAME,
      DATA_TYPE,
      IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'affiliate_products'
    ORDER BY ORDINAL_POSITION
  `;

  console.log('📋 affiliate_products 테이블 컬럼:');
  columns.slice(0, 10).forEach(col => {
    console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'required'})`);
  });
  console.log(`   ... (총 ${columns.length}개 컬럼)\n`);

  // 2. 현재 Products 데이터 확인
  const products = await prisma.product.findMany({
    include: {
      user: {
        select: {
          shopName: true,
        },
      },
    },
  });

  console.log(`📦 현재 affiliate_products 테이블 데이터 (총 ${products.length}개):`);
  products.forEach(p => {
    console.log(`   - ID: ${p.id}`);
    console.log(`     상품명: ${p.product_name}`);
    console.log(`     가격: ${p.sale_price}`);
    console.log(`     상점: ${p.store_name || p.user?.shopName}`);
    console.log(`     활성화: ${p.enabled}`);
    console.log('');
  });

  if (products.length === 0) {
    console.log('❌ 상품이 없습니다!');
  } else {
    console.log('✅ 상품이 정상적으로 등록되어 있습니다!');
  }
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


