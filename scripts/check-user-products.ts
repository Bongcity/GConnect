/**
 * 특정 사용자의 상품 확인 및 삭제 스크립트
 */

import { PrismaClient } from '@gconnect/db';

const prisma = new PrismaClient();

const USER_ID = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa'; // 키친메이커

async function main() {
  console.log('🔍 사용자 상품 확인 중...\n');

  // 1. 사용자 정보 확인
  const user = await prisma.user.findUnique({
    where: { id: USER_ID },
    select: {
      id: true,
      email: true,
      shopName: true,
      naverApiEnabled: true,
      naverClientId: true,
    },
  });

  if (!user) {
    console.log('❌ 사용자를 찾을 수 없습니다!');
    return;
  }

  console.log('👤 사용자 정보:');
  console.log(`   ID: ${user.id}`);
  console.log(`   이메일: ${user.email}`);
  console.log(`   상점명: ${user.shopName || '없음'}`);
  console.log(`   네이버 API: ${user.naverApiEnabled ? '활성화' : '비활성화'}`);
  console.log(`   Client ID: ${user.naverClientId || '없음'}`);
  console.log('\n');

  // 2. 상품 목록 조회
  const products = await prisma.product.findMany({
    where: { userId: USER_ID },
    orderBy: { created_at: 'desc' },
  });

  console.log(`📦 등록된 상품: ${products.length}개\n`);

  if (products.length > 0) {
    console.log('상품 목록:');
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. ID: ${p.id}`);
      console.log(`   상품명: ${p.product_name}`);
      console.log(`   가격: ${p.sale_price}원`);
      console.log(`   상점: ${p.store_name || '없음'}`);
      console.log(`   활성화: ${p.enabled}`);
      console.log(`   생성일: ${p.created_at}`);
      console.log('');
    });

    // 3. 삭제 확인
    console.log('⚠️  이 상품들을 모두 삭제하시겠습니까?');
    console.log('삭제하려면 아래 명령어를 실행하세요:\n');
    console.log('npx tsx scripts/delete-user-products.ts\n');
  } else {
    console.log('✅ 상품이 없습니다!');
  }
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

