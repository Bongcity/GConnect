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
      description: `최고급 노이즈 캔슬링 기능을 갖춘 무선 이어폰입니다.

🎵 주요 특징:
• 최신 ANC 3.0 기술로 주변 소음 99% 차단
• 40시간 장시간 재생 (ANC ON 상태)
• IPX7 방수 등급으로 땀과 물에 강함
• 고음질 AAC/aptX 코덱 지원
• 블루투스 5.3으로 끊김 없는 연결
• 터치 컨트롤 및 음성 비서 지원

📦 구성품:
- 이어폰 본체 + 충전 케이스
- 이어팁 (S, M, L) 3종
- USB-C 충전 케이블
- 휴대용 파우치
- 사용 설명서

🎁 특별 혜택:
지금 구매하시면 전용 케이스를 무료로 드립니다!`,
      price: 89000,
      salePrice: 69900,
      stockQuantity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      category1: '전자기기',
      category2: '음향기기',
      category3: '이어폰',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: '게이밍 무선 마우스 RGB Pro',
      description: `프로게이머를 위한 궁극의 게이밍 마우스!

⚡ 퍼포먼스:
• 16,000 DPI 고정밀 광학 센서
• 1ms 무선 응답 속도 (유선과 동일)
• 최대 70시간 배터리 수명
• RGB OFF 시 100시간 사용 가능

🎮 게이밍 특화:
• 8개 프로그래밍 가능 버튼
• 온보드 메모리로 설정 저장
• 1,600만 색상 RGB 조명
• 전용 소프트웨어로 매크로 설정
• 인체공학적 디자인으로 장시간 사용 가능

🏆 프로게이머 추천:
"딜레이가 전혀 없고 그립감이 최고입니다" - eSports 프로게이머

📦 패키지 구성:
- 마우스 본체
- USB 무선 동글
- USB-C 충전 케이블
- 논슬립 그립 스티커
- 사용 설명서`,
      price: 65000,
      salePrice: 49900,
      stockQuantity: 35,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
      category1: '전자기기',
      category2: '컴퓨터 주변기기',
      category3: '마우스',
      isActive: true,
      isGoogleExposed: true,
    },
    {
      name: '기계식 키보드 블루 스위치 Pro',
      description: `타이핑의 즐거움을 경험하세요! 체리 MX 블루 스위치의 명품 키보드

⌨️ 스위치 특징:
• 독일 Cherry MX Blue 정품 스위치
• 클리키한 타건감과 명확한 피드백
• 5천만회 내구성 보증
• 타이핑 애호가들의 1순위 선택

💎 프리미엄 디자인:
• CNC 가공 알루미늄 상판
• 이중 사출 PBT 키캡 (마모 없음)
• RGB Per-Key 백라이트
• 18가지 조명 효과
• USB-C 탈착식 케이블

🎯 편의 기능:
• N-Key 롤오버 지원
• 미디어 컨트롤 전용 키
• 윈도우 잠금 키
• 높이 조절 받침대 2단계
• 전용 소프트웨어로 매크로 설정

📱 호환성:
Windows, Mac, Linux 모두 지원

✨ 제품 보증:
2년 무상 A/S + 스위치 평생 보증`,
      price: 129000,
      salePrice: null,
      stockQuantity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
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
      name: '런닝화 에어 쿠션 프로 2024',
      description: `마라톤 완주를 위한 최고의 파트너! 프로 러너들이 선택한 런닝화

👟 혁신적인 쿠셔닝:
• 듀얼 에어 쿠션 시스템
• 충격 흡수율 35% 향상
• 반발력과 안정성의 완벽한 균형
• 장거리 러닝 시 발 피로 최소화

🏃 최적의 퍼포먼스:
• 엔지니어링 메쉬 갑피로 극강의 통기성
• 200g 경량 설계 (270mm 기준)
• 탄소섬유 플레이트로 추진력 극대화
• 아웃솔 러버로 뛰어난 접지력

⚡ 기술 스펙:
• 드롭: 8mm (힐-토)
• 미드솔: 듀얼 밀도 EVA 폼
• 아웃솔: 내마모 고무 (5,000km 보증)
• 무게: 200g (편측 기준)

🎨 디자인:
• 6가지 컬러 옵션 (블랙, 화이트, 네이비, 레드, 그린, 옐로우)
• 반사 로고로 야간 러닝 안전성 향상
• 프리미엄 스웨이드 힐 카운터

👍 사용자 리뷰:
"풀코스 마라톤 3번 뛰었는데 발 한 번 안 아팠어요!" ⭐⭐⭐⭐⭐
"쿠션이 정말 좋아서 무릎 부담이 확 줄었습니다" ⭐⭐⭐⭐⭐

📏 사이즈:
230mm ~ 295mm (5mm 단위)
발볼이 넓으신 분은 한 치수 큰 사이즈 추천`,
      price: 119000,
      salePrice: 89900,
      stockQuantity: 45,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
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

