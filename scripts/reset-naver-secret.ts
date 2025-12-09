/**
 * 잘못 저장된 네이버 API 시크릿 초기화 스크립트
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 naverClientSecret 초기화 시작...\n');

    const result = await prisma.user.updateMany({
      where: {
        naverClientSecret: {
          not: null,
        },
      },
      data: {
        naverClientSecret: null,
      },
    });

    console.log(`✅ ${result.count}개의 사용자 naverClientSecret이 초기화되었습니다.`);
    console.log('\n📝 다음 단계:');
    console.log('   1. 설정 페이지에서 네이버 API 키를 다시 입력해주세요.');
    console.log('   2. API 연결 테스트를 실행해주세요.');
  } catch (error) {
    console.error('❌ 에러:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

