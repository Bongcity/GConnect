/**
 * 특정 사용자의 모든 상품 삭제 스크립트
 */

import { PrismaClient } from '@gconnect/db';

const prisma = new PrismaClient();

const USER_ID = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa'; // 키친메이커

async function main() {
  console.log('🗑️  사용자 상품 삭제 중...\n');

  // 삭제 전 확인
  const countBefore = await prisma.product.count({
    where: { userId: USER_ID },
  });

  console.log(`삭제할 상품: ${countBefore}개\n`);

  if (countBefore === 0) {
    console.log('✅ 삭제할 상품이 없습니다!');
    return;
  }

  // 상품 삭제
  const result = await prisma.product.deleteMany({
    where: { userId: USER_ID },
  });

  console.log(`✅ ${result.count}개 상품 삭제 완료!\n`);

  // 삭제 후 확인
  const countAfter = await prisma.product.count({
    where: { userId: USER_ID },
  });

  console.log(`남은 상품: ${countAfter}개`);
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

