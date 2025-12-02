import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('📦 플랜 생성 시작...\n');

    // 1. Starter 플랜 (10K)
    const starter = await prisma.plan.upsert({
      where: { id: 'starter-plan-id' },
      update: {},
      create: {
        id: 'starter-plan-id',
        name: 'STARTER',
        displayName: 'Starter (10K)',
        description: '소규모 스토어를 위한 시작 플랜',
        maxProducts: 10000,
        maxApiCalls: 30000,
        monthlyPrice: 300000,
        yearlyPrice: 3240000,
        features: JSON.stringify([
          '최대 10,000개 상품 동기화',
          '월 30,000회 API 호출',
          '기본 성과 분석',
          '자동 동기화 스케줄러',
          '이메일 알림',
        ]),
        isActive: true,
        isPublic: true,
        sortOrder: 1,
      },
    });
    console.log('✅ Starter 플랜 생성:', starter.displayName);

    // 2. Pro 플랜 (50K)
    const pro = await prisma.plan.upsert({
      where: { id: 'pro-plan-id' },
      update: {},
      create: {
        id: 'pro-plan-id',
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
    console.log('✅ Pro 플랜 생성:', pro.displayName);

    // 3. Enterprise 플랜 (50K+)
    const enterprise = await prisma.plan.upsert({
      where: { id: 'enterprise-plan-id' },
      update: {},
      create: {
        id: 'enterprise-plan-id',
        name: 'ENTERPRISE',
        displayName: 'Enterprise (50K+)',
        description: '대형 스토어를 위한 엔터프라이즈 플랜',
        maxProducts: 999999,
        maxApiCalls: 999999,
        monthlyPrice: 0, // 협의
        yearlyPrice: 0,
        features: JSON.stringify([
          '무제한 상품 동기화',
          '무제한 API 호출',
          '프리미엄 성과 분석',
          '자동 동기화 스케줄러',
          '웹훅 연동 (Slack, Discord 등)',
          '전담 고객 지원',
          '맞춤형 기능 개발',
        ]),
        isActive: true,
        isPublic: true,
        sortOrder: 3,
      },
    });
    console.log('✅ Enterprise 플랜 생성:', enterprise.displayName);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 모든 플랜 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 생성된 플랜:');
    console.log('1. Starter (10K) - 월 30만원');
    console.log('2. Pro (50K) - 월 80만원');
    console.log('3. Enterprise (50K+) - 협의');
    console.log('\n다음 명령어로 테스트 구독을 생성하세요:');
    console.log('npx tsx scripts/create-test-subscription.ts');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

