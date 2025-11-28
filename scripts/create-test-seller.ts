import { prisma } from '../packages/db';
import bcrypt from 'bcryptjs';

async function createTestSeller() {
  try {
    console.log('테스트 셀러 생성 시작...');

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@seller.com' },
    });

    if (existingUser) {
      console.log('이미 존재하는 이메일입니다. 기존 계정 정보:');
      console.log({
        email: existingUser.email,
        name: existingUser.name,
        shopName: existingUser.shopName,
        shopStatus: existingUser.shopStatus,
      });
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash('test1234', 12);

    // 테스트 셀러 생성
    const seller = await prisma.user.create({
      data: {
        email: 'test@seller.com',
        password: hashedPassword,
        name: '테스트 판매자',
        shopName: '테스트 스토어',
        shopStatus: 'ACTIVE', // 즉시 활성화
        phone: '010-1234-5678',
        naverShopUrl: 'https://smartstore.naver.com/testshop',
        naverShopId: 'testshop',
      },
    });

    console.log('✅ 테스트 셀러가 성공적으로 생성되었습니다!');
    console.log('\n로그인 정보:');
    console.log('이메일: test@seller.com');
    console.log('비밀번호: test1234');
    console.log('\n계정 정보:');
    console.log({
      id: seller.id,
      email: seller.email,
      name: seller.name,
      shopName: seller.shopName,
      shopStatus: seller.shopStatus,
      phone: seller.phone,
      naverShopUrl: seller.naverShopUrl,
    });

  } catch (error) {
    console.error('❌ 테스트 셀러 생성 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSeller();

