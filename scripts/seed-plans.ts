import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('📦 플랜 생성 시작...\n');

    // 1. Starter 플랜 (10개)
    const starter = await prisma.plan.upsert({
      where: { id: 'starter-plan-id' },
      update: {},
      create: {
        id: 'starter-plan-id',
        name: 'STARTER',
        displayName: 'Starter',
        description: '소규모 스토어를 위한 시작 플랜 (10개 이하)',
        maxProducts: 10,
        maxApiCalls: 1000,
        monthlyPrice: 39000,
        yearlyPrice: 468000, // 월 39,000 * 12
        features: JSON.stringify([
          '최대 10개 상품 동기화',
          '기본 SEO 구조화',
          '기본 통계/리포트',
          '자동 상품 동기화',
          '이메일 지원',
        ]),
        isActive: true,
        isPublic: true,
        sortOrder: 1,
      },
    });
    console.log('✅ Starter 플랜 생성:', starter.displayName);

    // 2. Pro 플랜 (50개)
    const pro = await prisma.plan.upsert({
      where: { id: 'pro-plan-id' },
      update: {},
      create: {
        id: 'pro-plan-id',
        name: 'PRO',
        displayName: 'Pro',
        description: '성장하는 스토어를 위한 프로 플랜 (50개 이하)',
        maxProducts: 50,
        maxApiCalls: 5000,
        monthlyPrice: 59000,
        yearlyPrice: 708000, // 월 59,000 * 12
        features: JSON.stringify([
          '최대 50개 상품 동기화',
          '고급 SEO 구조화',
          '고급 통계 (키워드/경쟁사/CTR 분석)',
          '우선 기술 지원',
          '자동 상품 동기화',
          'API 연동',
        ]),
        isActive: true,
        isPublic: true,
        sortOrder: 2,
      },
    });
    console.log('✅ Pro 플랜 생성:', pro.displayName);

    // 3. Enterprise 플랜 (50개 초과)
    const enterprise = await prisma.plan.upsert({
      where: { id: 'enterprise-plan-id' },
      update: {},
      create: {
        id: 'enterprise-plan-id',
        name: 'ENTERPRISE',
        displayName: 'Enterprise',
        description: '대규모 스토어 및 에이전시를 위한 커스텀 플랜 (50개 초과)',
        maxProducts: 999999,
        maxApiCalls: 999999,
        monthlyPrice: 0, // 협의
        yearlyPrice: 0,
        features: JSON.stringify([
          '커스텀 SEO 구조화',
          '커스텀 연동/리포트',
          '전담 매니저',
          'SLA 보장',
          '우선 기술 지원',
          '웹훅 연동 (Slack, Discord 등)',
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
    console.log('1. Starter (10개) - 월 39,000원');
    console.log('2. Pro (50개) - 월 59,000원');
    console.log('3. Enterprise (50개 초과) - 협의');
    console.log('\n다음 명령어로 테스트 구독을 생성하세요:');
    console.log('npx tsx scripts/create-test-subscription.ts');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

