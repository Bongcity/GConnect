/**
 * 네이버 커머스 API - 채널 정보 조회 테스트
 * GET /v1/seller/channels
 * 
 * 실행 방법: cd apps/seller && npx tsx ../../scripts/test-channel-info.ts
 */

import { PrismaClient as GConnectPrismaClient } from '../../packages/db/src/gconnect';
import { NaverApiClient } from './lib/naver-api';
import { decrypt } from './lib/crypto';

const prisma = new GConnectPrismaClient();

async function testChannelInfo() {
  try {
    console.log('🔍 채널 정보 조회 테스트 시작...\n');

    // 1. 사용자 정보 조회
    const userId = '9ed473bc-fa0e-49a3-9e9a-58e5f68d24fa';
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        naverClientId: true,
        naverClientSecret: true,
      },
    });

    if (!user) {
      console.error('❌ 사용자를 찾을 수 없습니다.');
      return;
    }

    console.log('✅ 사용자 정보:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Client ID: ${user.naverClientId}`);
    console.log(`   - Encrypted Secret: ${user.naverClientSecret?.substring(0, 50)}...`);
    console.log();

    // 2. Client Secret 복호화
    if (!user.naverClientSecret) {
      console.error('❌ Client Secret이 없습니다.');
      return;
    }

    const decryptedSecret = decrypt(user.naverClientSecret);
    console.log('🔓 복호화된 Client Secret:');
    console.log(`   - 길이: ${decryptedSecret.length}`);
    console.log(`   - 값: ${decryptedSecret}`);
    console.log();

    // 3. NaverApiClient 생성
    const naverClient = new NaverApiClient(
      user.naverClientId!,
      decryptedSecret
    );

    console.log('📞 채널 정보 조회 중...\n');

    // 4. 채널 정보 조회
    const channelInfo = await naverClient.getChannelInfo();

    console.log('✅ 채널 정보 응답:');
    console.log(JSON.stringify(channelInfo, null, 2));
    console.log();

    // 5. 스토어 ID 추출 시도
    console.log('🔍 스토어 ID 추출 시도...');
    const storeId = await naverClient.getStoreId();
    console.log(`   - 추출된 스토어 ID: ${storeId}`);
    console.log();

    // 6. 응답 구조 분석
    if (Array.isArray(channelInfo)) {
      console.log('📊 응답이 배열입니다. 첫 번째 항목:');
      if (channelInfo.length > 0) {
        console.log(JSON.stringify(channelInfo[0], null, 2));
        console.log('\n🔑 사용 가능한 필드들:');
        console.log(Object.keys(channelInfo[0]));
      }
    } else if (typeof channelInfo === 'object' && channelInfo !== null) {
      console.log('📊 응답이 객체입니다. 사용 가능한 필드들:');
      console.log(Object.keys(channelInfo));
    }

  } catch (error: any) {
    console.error('❌ 테스트 실패:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('   - Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testChannelInfo();

