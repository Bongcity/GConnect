/**
 * SELLER 샘플 데이터 생성 스크립트
 * 
 * DDRo 기준 구조에 맞춘 GCONNECT 파트너 스토어 상품 데이터 생성
 * - User (SELLER) 생성
 * - Products (affiliate_products 구조) 생성
 */

import { PrismaClient } from '@gconnect/db';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 SELLER 샘플 데이터 생성 시작...\n');

  // 0. 모든 기존 데이터 삭제
  console.log('0️⃣  기존 데이터 정리 중...');
  const deletedProducts = await prisma.product.deleteMany({});
  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`   - 기존 상품 ${deletedProducts.count}개 삭제됨`);
  console.log(`   - 기존 사용자 ${deletedUsers.count}명 삭제됨\n`);

  // 1. 테스트 SELLER 사용자 생성
  console.log('1️⃣  테스트 SELLER 사용자 생성 중...');

  const seller1 = await prisma.user.create({
    data: {
      email: 'seller1@gconnect.com',
      name: '김지훈',
      naverUserId: 'naver_seller1_test', // unique constraint를 위한 고유 값
      shopName: 'GConnect 프리미엄샵',
      shopStatus: 'ACTIVE',
      naverShopUrl: 'https://smartstore.naver.com/gconnect-premium',
      naverShopId: 'gconnect-premium',
      phone: '010-1234-5678',
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'seller2@gconnect.com',
      name: '이서연',
      naverUserId: 'naver_seller2_test', // unique constraint를 위한 고유 값
      shopName: '네이처라이프 스토어',
      shopStatus: 'ACTIVE',
      naverShopUrl: 'https://smartstore.naver.com/naturelife',
      naverShopId: 'naturelife',
      phone: '010-9876-5432',
    },
  });

  console.log(`✅ SELLER 2명 생성 완료`);
  console.log(`   - ${seller1.shopName} (${seller1.email})`);
  console.log(`   - ${seller2.shopName} (${seller2.email})\n`);

  // 2. 샘플 상품 데이터 생성
  console.log('2️⃣  샘플 상품 생성 중...');

  const productsData = [
    // GConnect 프리미엄샵 상품들
    {
      userId: seller1.id,
      store_name: seller1.shopName,
      brand_store: true,
      store_status: 'ACTIVE',
      product_name: '프리미엄 유기농 커피 원두 500g (에티오피아 예가체프)',
      product_status: 'ON_SALE',
      sale_price: BigInt(25000),
      discounted_sale_price: BigInt(19900),
      discounted_rate: 0.204,
      commission_rate: 0.05,
      promotion_commission_rate: 0.08,
      representative_product_image_url: null,
      other_product_image_urls: null,
      product_url: 'https://smartstore.naver.com/gconnect-premium/products/1001',
      product_description_url: 'https://smartstore.naver.com/gconnect-premium/products/1001',
      affiliate_url: 'https://smartstore.naver.com/gconnect-premium/products/1001',
      promotion_json: null,
      enabled: true,
      source_keyword: '유기농 커피',
      source_cid: '50000165',
      source_rank: 1,
      google_in: 1,
    },
    {
      userId: seller1.id,
      store_name: seller1.shopName,
      brand_store: true,
      store_status: 'ACTIVE',
      product_name: '스마트 LED 스탠드 무선충전 (눈 보호 기능)',
      product_status: 'ON_SALE',
      sale_price: BigInt(79000),
      discounted_sale_price: BigInt(59000),
      discounted_rate: 0.253,
      commission_rate: 0.05,
      promotion_commission_rate: 0.08,
      representative_product_image_url: null,
      other_product_image_urls: null,
      product_url: 'https://smartstore.naver.com/gconnect-premium/products/1002',
      product_description_url: 'https://smartstore.naver.com/gconnect-premium/products/1002',
      affiliate_url: 'https://smartstore.naver.com/gconnect-premium/products/1002',
      promotion_json: null,
      enabled: true,
      source_keyword: 'LED 스탠드',
      source_cid: '50001224',
      source_rank: 2,
      google_in: 1,
    },
    {
      userId: seller1.id,
      store_name: seller1.shopName,
      brand_store: true,
      store_status: 'ACTIVE',
      product_name: '에어프라이어 5.5L 대용량 (스마트 터치 패널)',
      product_status: 'ON_SALE',
      sale_price: BigInt(129000),
      discounted_sale_price: BigInt(99000),
      discounted_rate: 0.233,
      commission_rate: 0.05,
      promotion_commission_rate: 0.08,
      representative_product_image_url: null,
      other_product_image_urls: null,
      product_url: 'https://smartstore.naver.com/gconnect-premium/products/1003',
      product_description_url: 'https://smartstore.naver.com/gconnect-premium/products/1003',
      affiliate_url: 'https://smartstore.naver.com/gconnect-premium/products/1003',
      promotion_json: null,
      enabled: true,
      source_keyword: '에어프라이어',
      source_cid: '50000831',
      source_rank: 3,
      google_in: 1,
    },
    {
      userId: seller1.id,
      store_name: seller1.shopName,
      brand_store: true,
      store_status: 'ACTIVE',
      product_name: '게이밍 기계식 키보드 RGB (청축, N키 롤오버)',
      product_status: 'ON_SALE',
      sale_price: BigInt(149000),
      discounted_sale_price: null,
      discounted_rate: null,
      commission_rate: 0.05,
      promotion_commission_rate: 0.08,
      representative_product_image_url: null,
      other_product_image_urls: null,
      product_url: 'https://smartstore.naver.com/gconnect-premium/products/1004',
      product_description_url: 'https://smartstore.naver.com/gconnect-premium/products/1004',
      affiliate_url: 'https://smartstore.naver.com/gconnect-premium/products/1004',
      promotion_json: null,
      enabled: true,
      source_keyword: '기계식 키보드',
      source_cid: '50000169',
      source_rank: 4,
      google_in: 1,
    },

    // 네이처라이프 스토어 상품들
    {
      userId: seller2.id,
      store_name: seller2.shopName,
      brand_store: false,
      store_status: 'ACTIVE',
      product_name: '천연 아로마 디퓨저 세트 (라벤더 향)',
      product_status: 'ON_SALE',
      sale_price: BigInt(35000),
      discounted_sale_price: BigInt(27900),
      discounted_rate: 0.203,
      commission_rate: 0.05,
      promotion_commission_rate: 0.08,
      representative_product_image_url: null,
      other_product_image_urls: null,
      product_url: 'https://smartstore.naver.com/naturelife/products/2001',
      product_description_url: 'https://smartstore.naver.com/naturelife/products/2001',
      affiliate_url: 'https://smartstore.naver.com/naturelife/products/2001',
      promotion_json: null,
      enabled: true,
      source_keyword: '아로마 디퓨저',
      source_cid: '50002707',
      source_rank: 1,
      google_in: 1,
    },
    {
      userId: seller2.id,
      store_name: seller2.shopName,
      brand_store: false,
      store_status: 'ACTIVE',
      product_name: '유기농 허브티 세트 10종 (선물용 포장)',
      product_status: 'ON_SALE',
      sale_price: BigInt(42000),
      discounted_sale_price: BigInt(34900),
      discounted_rate: 0.169,
      commission_rate: 0.05,
      promotion_commission_rate: 0.08,
      representative_product_image_url: null,
      other_product_image_urls: null,
      product_url: 'https://smartstore.naver.com/naturelife/products/2002',
      product_description_url: 'https://smartstore.naver.com/naturelife/products/2002',
      affiliate_url: 'https://smartstore.naver.com/naturelife/products/2002',
      promotion_json: null,
      enabled: true,
      source_keyword: '허브티',
      source_cid: '50000165',
      source_rank: 2,
      google_in: 1,
    },
    {
      userId: seller2.id,
      store_name: seller2.shopName,
      brand_store: false,
      store_status: 'ACTIVE',
      product_name: '친환경 대나무 칫솔 세트 (5개입)',
      product_status: 'ON_SALE',
      sale_price: BigInt(15000),
      discounted_sale_price: BigInt(12900),
      discounted_rate: 0.14,
      commission_rate: 0.05,
      promotion_commission_rate: 0.08,
      representative_product_image_url: null,
      other_product_image_urls: null,
      product_url: 'https://smartstore.naver.com/naturelife/products/2003',
      product_description_url: 'https://smartstore.naver.com/naturelife/products/2003',
      affiliate_url: 'https://smartstore.naver.com/naturelife/products/2003',
      promotion_json: null,
      enabled: true,
      source_keyword: '대나무 칫솔',
      source_cid: '50002699',
      source_rank: 3,
      google_in: 1,
    },
  ];

  let createdCount = 0;
  for (const productData of productsData) {
    await prisma.product.create({
      data: productData,
    });
    createdCount++;
  }

  console.log(`✅ 샘플 상품 ${createdCount}개 생성 완료\n`);

  // 3. 생성된 데이터 확인
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();

  console.log('📊 최종 통계:');
  console.log(`   - 총 SELLER 수: ${totalUsers}`);
  console.log(`   - 총 상품 수: ${totalProducts}`);
  console.log(`   - ${seller1.shopName}: ${productsData.filter(p => p.userId === seller1.id).length}개`);
  console.log(`   - ${seller2.shopName}: ${productsData.filter(p => p.userId === seller2.id).length}개`);

  console.log('\n🎉 SELLER 샘플 데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

