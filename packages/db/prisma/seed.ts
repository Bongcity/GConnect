import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 1. 테스트 사용자 생성 또는 조회
  let testUser = await prisma.user.findUnique({
    where: { email: 'test@gconnect.com' },
  });

  if (!testUser) {
    console.log('👤 테스트 사용자 생성 중...');
    testUser = await prisma.user.create({
      data: {
        email: 'test@gconnect.com',
        name: '테스트 스토어',
        shopName: 'GConnect 테스트샵',
        shopStatus: 'ACTIVE',
        naverShopUrl: 'https://smartstore.naver.com/testshop',
        naverShopId: 'testshop',
        phone: '010-1234-5678',
      },
    });
    console.log('✅ 테스트 사용자 생성 완료:', testUser.email);
  } else {
    console.log('✅ 기존 테스트 사용자 사용:', testUser.email);
  }

  // 2. 기존 테스트 상품 삭제 (재실행 시 중복 방지)
  const deletedCount = await prisma.product.deleteMany({
    where: { userId: testUser.id },
  });
  console.log(`🗑️  기존 상품 ${deletedCount.count}개 삭제 완료`);

  // 3. 테스트 상품 생성
  console.log('📦 테스트 상품 생성 중...');

  const products = [
    {
      name: '프리미엄 무선 이어폰 ANC Pro',
      description: '최고급 노이즈 캔슬링 기능을 갖춘 무선 이어폰입니다. 40시간 재생, IPX7 방수, 고음질 AAC 코덱 지원으로 완벽한 음악 감상이 가능합니다.',
      price: 89000,
      salePrice: 69900,
      stockQuantity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
      category1: '전자기기',
      category2: '음향기기',
      category3: '이어폰',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: '게이밍 무선 마우스 RGB',
      description: '16,000 DPI 고정밀 센서와 화려한 RGB 라이팅을 갖춘 게이밍 마우스. 8개의 프로그래밍 가능한 버튼으로 완벽한 게임 플레이를 경험하세요.',
      price: 65000,
      salePrice: 49900,
      stockQuantity: 35,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
      category1: '전자기기',
      category2: '컴퓨터 주변기기',
      category3: '마우스',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: '기계식 키보드 블루 스위치',
      description: '체리 MX 블루 스위치를 탑재한 풀사이즈 기계식 키보드. RGB 백라이트와 알루미늄 프레임으로 내구성과 감성을 동시에 만족시킵니다.',
      price: 129000,
      salePrice: null,
      stockQuantity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
      category1: '전자기기',
      category2: '컴퓨터 주변기기',
      category3: '키보드',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: '오버핏 베이직 티셔츠 5종 세트',
      description: '100% 프리미엄 코튼으로 제작된 오버핏 티셔츠. 5가지 컬러로 구성되어 있어 데일리룩으로 완벽합니다. 사이즈: S~2XL',
      price: 45000,
      salePrice: 29900,
      stockQuantity: 100,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
      category1: '패션',
      category2: '남성의류',
      category3: '티셔츠',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: '프리미엄 가죽 크로스백',
      description: '이탈리안 천연 가죽으로 제작된 고급 크로스백. 심플한 디자인으로 어떤 스타일에도 잘 어울리며, 내구성이 뛰어납니다.',
      price: 89000,
      salePrice: 69000,
      stockQuantity: 25,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
      category1: '패션',
      category2: '가방',
      category3: '크로스백',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: '런닝화 에어 쿠션 프로',
      description: '최첨단 에어 쿠션 기술로 발의 피로를 최소화한 런닝화. 통기성 메쉬 소재와 인체공학적 디자인으로 장거리 러닝에 최적화되어 있습니다.',
      price: 119000,
      salePrice: 89900,
      stockQuantity: 45,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      category1: '패션',
      category2: '신발',
      category3: '운동화',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: '스테인리스 보온 텀블러 500ml',
      description: '24시간 보온/보냉이 가능한 진공 단열 텀블러. 304 스테인리스 스틸로 제작되어 위생적이며, 슬림한 디자인으로 휴대가 간편합니다.',
      price: 35000,
      salePrice: 24900,
      stockQuantity: 80,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80',
      category1: '생활용품',
      category2: '주방용품',
      category3: '텀블러',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: '메모리폼 허리 쿠션',
      description: '고밀도 메모리폼으로 제작된 인체공학적 허리 쿠션. 장시간 앉아있어도 편안하며, 탈착 가능한 커버로 세탁이 용이합니다.',
      price: 29000,
      salePrice: null,
      stockQuantity: 60,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
      category1: '생활용품',
      category2: '인테리어',
      category3: '쿠션',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: 'LED 무선 스탠드 조명',
      description: '3단계 밝기 조절과 색온도 조절이 가능한 무선 충전식 LED 스탠드. USB 충전 방식으로 어디서나 사용 가능하며, 세련된 디자인이 돋보입니다.',
      price: 45000,
      salePrice: 35900,
      stockQuantity: 40,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80',
      category1: '생활용품',
      category2: '인테리어',
      category3: '조명',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: '프리미엄 아몬드 믹스 1kg',
      description: '엄선된 생아몬드, 호두, 캐슈넛의 완벽한 조합. 무첨가 무가염으로 건강하게 즐길 수 있으며, 신선도 유지를 위한 지퍼백 포장입니다.',
      price: 28000,
      salePrice: 19900,
      stockQuantity: 150,
      imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&q=80',
      category1: '식품',
      category2: '간식',
      category3: '견과류',
      isActive: true,
      isGoogleExposed: true,
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        ...productData,
        userId: testUser.id,
        categoryPath: `${productData.category1} > ${productData.category2} > ${productData.category3}`,
        syncStatus: 'SYNCED',
        lastSyncedAt: new Date(),
      },
    });
    console.log(`  ✓ ${product.name}`);
  }

  console.log(`\n✅ 총 ${products.length}개의 테스트 상품 생성 완료!`);
  console.log('\n🎉 시드 데이터 생성이 완료되었습니다!');
  console.log('📍 상품 사이트 확인: http://localhost:3002\n');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

