import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. test@seller.com 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: 'test@seller.com' },
    });

    if (!user) {
      console.error('❌ test@seller.com 사용자를 찾을 수 없습니다.');
      console.log('먼저 Seller 사이트에서 회원가입을 해주세요.');
      return;
    }

    console.log('✅ 사용자 찾음:', user.email);

    // 2. Pro 플랜 생성 또는 찾기
    let proPlan = await prisma.plan.findFirst({
      where: { name: 'PRO' },
    });

    if (!proPlan) {
      console.log('📦 Pro 플랜 생성 중...');
      proPlan = await prisma.plan.create({
        data: {
          name: 'PRO',
          displayName: 'Pro (50K)',
          description: '중소형 스토어를 위한 프로 플랜',
          maxProducts: 50000,
          maxApiCalls: 100000,
          monthlyPrice: 800000,
          yearlyPrice: 8640000,
          features: JSON.stringify([
            '최대 50,000개 상품 동기화',
            '월 100,000회 API 호출',
            '고급 성과 분석',
            '자동 동기화 스케줄러',
            '이메일 알림',
            '우선 고객 지원',
          ]),
          isActive: true,
          isPublic: true,
          sortOrder: 2,
        },
      });
      console.log('✅ Pro 플랜 생성 완료');
    } else {
      console.log('✅ Pro 플랜 찾음:', proPlan.displayName);
    }

    // 3. 기존 구독 삭제 (있다면)
    await prisma.userSubscription.deleteMany({
      where: { userId: user.id },
    });
    console.log('🗑️  기존 구독 삭제 완료');

    // 4. 5일 후 만료되는 구독 생성
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 1); // 1개월 전 시작
    
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 5); // 5일 후 만료

    // 5. 사용자의 현재 상품 수 조회
    const productCount = await prisma.product.count({
      where: { userId: user.id },
    });

    const subscription = await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: proPlan.id,
        startDate,
        endDate,
        status: 'ACTIVE',
        paymentMethod: 'MANUAL',
        paymentId: 'TEST_PAYMENT_' + Date.now(),
        currentProducts: productCount,
        autoRenew: true,
        adminNote: '테스트용 구독 (5일 후 만료)',
      },
    });

    console.log('\n✅ 구독 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 사용자:', user.email);
    console.log('📦 플랜:', proPlan.displayName);
    console.log('📅 시작일:', startDate.toLocaleDateString('ko-KR'));
    console.log('📅 종료일:', endDate.toLocaleDateString('ko-KR'));
    console.log('⏰ 남은 기간: 5일');
    console.log('📊 현재 상품 수:', productCount);
    console.log('📊 최대 상품 수:', proPlan.maxProducts);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 테스트 준비 완료! Seller 사이트에서 확인하세요.');
    console.log('🔗 http://localhost:3003/dashboard');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

