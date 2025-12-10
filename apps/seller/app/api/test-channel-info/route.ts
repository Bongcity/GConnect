/**
 * 네이버 채널 정보 조회 테스트 API
 * GET /api/test-channel-info
 * 
 * 사용법: https://seller.gconnect.kr/api/test-channel-info
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@gconnect/db';
import { NaverApiClient } from '@/lib/naver-api';
import { getDecryptedNaverApiKey } from '@/lib/naver-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('\n🔍🔍🔍 [TEST] 채널 정보 조회 테스트 시작...');

    // 1. 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`   - 사용자 ID: ${userId}`);

    // 2. 사용자 정보 조회
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
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log(`   - Email: ${user.email}`);
    console.log(`   - Client ID: ${user.naverClientId}`);
    console.log(`   - Encrypted Secret: ${user.naverClientSecret?.substring(0, 50)}...`);

    // 3. API 키 복호화
    const apiKey = await getDecryptedNaverApiKey(userId);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log(`   - 복호화된 Client ID: ${apiKey.clientId}`);
    console.log(`   - 복호화된 Client Secret 길이: ${apiKey.clientSecret.length}`);
    console.log(`   - 복호화된 Client Secret: ${apiKey.clientSecret}`);

    // 4. NaverApiClient 생성
    const naverClient = new NaverApiClient(
      apiKey.clientId,
      apiKey.clientSecret
    );

    console.log('\n📞 [TEST] 채널 정보 조회 중...');

    // 5. 채널 정보 조회
    const channelInfo = await naverClient.getChannelInfo();

    console.log('✅ [TEST] 채널 정보 응답:');
    console.log(JSON.stringify(channelInfo, null, 2));

    // 6. 스토어 ID 추출
    console.log('\n🔍 [TEST] 스토어 ID 추출 시도...');
    const storeId = await naverClient.getStoreId();
    console.log(`   - 추출된 스토어 ID: ${storeId}`);

    // 7. 응답 구조 분석
    let analysis: any = {
      responseType: typeof channelInfo,
      isArray: Array.isArray(channelInfo),
      extractedStoreId: storeId,
    };

    if (Array.isArray(channelInfo)) {
      analysis.arrayLength = channelInfo.length;
      if (channelInfo.length > 0) {
        analysis.firstItem = channelInfo[0];
        analysis.availableFields = Object.keys(channelInfo[0]);
      }
    } else if (typeof channelInfo === 'object' && channelInfo !== null) {
      analysis.availableFields = Object.keys(channelInfo);
    }

    console.log('\n📊 [TEST] 응답 분석:');
    console.log(JSON.stringify(analysis, null, 2));

    return NextResponse.json({
      success: true,
      channelInfo,
      analysis,
      storeId,
    });

  } catch (error: any) {
    console.error('\n❌❌❌ [TEST] 채널 정보 조회 실패:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('   - Stack:', error.stack);

    return NextResponse.json(
      {
        error: '채널 정보 조회 실패',
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      },
      { status: 500 }
    );
  }
}

