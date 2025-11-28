/**
 * GConnect 테스트 SELLER 및 상품 데이터 생성 스크립트
 * 
 * 실행 방법:
 * cd D:\GConnect\apps\product
 * npx tsx scripts/seed-test-data.ts
 */

import { prisma } from '@gconnect/db';

async function main() {
  console.log('🚀 테스트 데이터 생성 시작...\n');

  // 1. 테스트 SELLER 생성 또는 조회
  let user = await prisma.user.findUnique({
    where: { email: 'test.seller@gconnect.co.kr' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test.seller@gconnect.co.kr',
        name: '테스트 셀러',
        shopName: 'GConnect 공식 테스트샵',
        shopStatus: 'ACTIVE',
        naverShopUrl: 'https://smartstore.naver.com/gconnect-test',
        naverShopId: 'gconnect-test',
        phone: '010-1234-5678',
        naverApiEnabled: true,
      },
    });
    console.log(`✅ 테스트 SELLER 생성: ${user.id}`);
  } else {
    console.log(`ℹ️ 기존 테스트 SELLER 사용: ${user.id}`);
  }

  // 2. 기존 테스트 상품 개수 확인
  const existingProducts = await prisma.product.count({
    where: { userId: user.id },
  });

  if (existingProducts > 0) {
    console.log(`ℹ️ 기존 상품 ${existingProducts}개가 있습니다. 삭제 후 재생성합니다...`);
    await prisma.product.deleteMany({
      where: { userId: user.id },
    });
  }

  // 3. 테스트 상품 생성
  const testProducts = [
    {
      name: 'GConnect 프리미엄 무선 이어폰 Pro Max',
      description: '최고급 음질과 노이즈 캔슬링 기능을 탑재한 프리미엄 무선 이어폰입니다. 30시간 장시간 재생, IPX7 방수 등급, 초고속 충전 지원',
      price: 159000,
      salePrice: 129000,
      stockQuantity: 50,
      imageUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Wireless+Earbuds',
      thumbnailUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Wireless+Earbuds',
      category1: '전자기기',
      category2: '오디오',
      category3: '이어폰',
      categoryPath: '전자기기 > 오디오 > 이어폰',
      googleUrl: 'https://smartstore.naver.com/gconnect-test/products/1001',
    },
    {
      name: 'GConnect 스마트워치 Ultra 2024',
      description: '건강관리부터 운동까지! 심박수, 산소포화도, 수면 측정 기능이 있는 프리미엄 스마트워치입니다. 5일 배터리, 50m 방수',
      price: 289000,
      salePrice: 219000,
      stockQuantity: 30,
      imageUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Smart+Watch',
      thumbnailUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Smart+Watch',
      category1: '전자기기',
      category2: '웨어러블',
      category3: '스마트워치',
      categoryPath: '전자기기 > 웨어러블 > 스마트워치',
      googleUrl: 'https://smartstore.naver.com/gconnect-test/products/1002',
    },
    {
      name: 'GConnect 여행용 프리미엄 백팩 35L',
      description: '출장과 여행을 위한 완벽한 백팩! USB 충전 포트, 도난 방지 디자인, 15.6인치 노트북 수납 가능. 방수 소재 사용',
      price: 89000,
      salePrice: 69900,
      stockQuantity: 100,
      imageUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Travel+Backpack',
      thumbnailUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Travel+Backpack',
      category1: '패션',
      category2: '가방',
      category3: '백팩',
      categoryPath: '패션 > 가방 > 백팩',
      googleUrl: 'https://smartstore.naver.com/gconnect-test/products/1003',
    },
    {
      name: 'GConnect 게이밍 기계식 키보드 RGB',
      description: '정확한 타이핑감의 청축 스위치, 화려한 RGB 라이팅, N키 롤오버 지원. 게이머와 개발자를 위한 최적의 키보드',
      price: 149000,
      salePrice: null,
      stockQuantity: 80,
      imageUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Mechanical+Keyboard',
      thumbnailUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Mechanical+Keyboard',
      category1: '전자기기',
      category2: '컴퓨터 주변기기',
      category3: '키보드',
      categoryPath: '전자기기 > 컴퓨터 주변기기 > 키보드',
      googleUrl: 'https://smartstore.naver.com/gconnect-test/products/1004',
    },
    {
      name: 'GConnect 포터블 블루투스 스피커 20W',
      description: '강력한 저음과 선명한 고음! 20W 출력, 15시간 연속 재생, TWS 페어링 지원. 캠핑이나 파티에 최적',
      price: 79000,
      salePrice: 59900,
      stockQuantity: 120,
      imageUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Bluetooth+Speaker',
      thumbnailUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Bluetooth+Speaker',
      category1: '전자기기',
      category2: '오디오',
      category3: '스피커',
      categoryPath: '전자기기 > 오디오 > 스피커',
      googleUrl: 'https://smartstore.naver.com/gconnect-test/products/1005',
    },
    {
      name: 'GConnect 프리미엄 아라비카 원두 1kg',
      description: '에티오피아산 단일 원산지 원두. 풍부한 과일향과 부드러운 신맛이 특징. 로스팅 후 48시간 이내 배송',
      price: 45000,
      salePrice: 35900,
      stockQuantity: 200,
      imageUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Coffee+Beans',
      thumbnailUrl: 'https://via.placeholder.com/500x500/1a1a2e/39ff14?text=Coffee+Beans',
      category1: '식품',
      category2: '음료',
      category3: '커피',
      categoryPath: '식품 > 음료 > 커피',
      googleUrl: 'https://smartstore.naver.com/gconnect-test/products/1006',
    },
  ];

  console.log(`\n📦 ${testProducts.length}개의 테스트 상품 생성 중...`);

  for (const [index, productData] of testProducts.entries()) {
    await prisma.product.create({
      data: {
        ...productData,
        userId: user.id,
        isActive: true,
        isGoogleExposed: true,
        syncStatus: 'SYNCED',
      },
    });
    console.log(`  ✅ ${index + 1}. ${productData.name}`);
  }

  // 4. 결과 확인
  const createdProducts = await prisma.product.findMany({
    where: { userId: user.id },
    include: {
      user: {
        select: {
          shopName: true,
        },
      },
    },
  });

  console.log('\n========================================');
  console.log('✅ 테스트 데이터 생성 완료!');
  console.log('========================================');
  console.log(`SELLER: test.seller@gconnect.co.kr`);
  console.log(`샵명: ${user.shopName}`);
  console.log(`상품 개수: ${createdProducts.length}개`);
  console.log('========================================\n');

  // 상품 목록 출력
  console.log('📋 생성된 상품 목록:');
  createdProducts.forEach((product, index) => {
    const price = product.salePrice || product.price;
    console.log(`  ${index + 1}. ${product.name} - ${price?.toLocaleString()}원`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✨ 완료!');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('\n❌ 에러 발생:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

