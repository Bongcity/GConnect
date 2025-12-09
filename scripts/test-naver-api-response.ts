/**
 * 네이버 API 응답 구조 확인 스크립트
 */

import { NaverApiClient } from '../apps/seller/lib/naver-api';

const NAVER_CONFIG = {
  applicationId: '4KbqV13RTCuyfV95WDebVs',
  applicationSecret: '$2a$04$ZoPOOucB6lo1HxspiMs5be',
};

async function testNaverApiResponse() {
  console.log('🔍 네이버 API 응답 구조 확인 중...\n');

  try {
    const naverClient = new NaverApiClient({
      clientId: NAVER_CONFIG.applicationId,
      clientSecret: NAVER_CONFIG.applicationSecret,
    });

    // 첫 페이지만 가져오기
    console.log('📡 첫 페이지 상품 조회 중...\n');
    const result = await naverClient.getProducts(1, 10);

    console.log('📦 API 응답:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n');

    console.log('📊 요약:');
    console.log(`- 총 상품 수: ${result.totalCount}`);
    console.log(`- 조회된 상품: ${result.products.length}개`);
    
    if (result.products.length > 0) {
      console.log('\n🏷️ 첫 번째 상품 정보:');
      const first = result.products[0];
      console.log(JSON.stringify(first, null, 2));
    } else {
      console.log('\n⚠️ 조회된 상품이 없습니다!');
      console.log('\n확인 사항:');
      console.log('1. 키친메이커 스마트스토어에 상품이 등록되어 있는지 확인');
      console.log('2. API 키가 올바른 상점의 키인지 확인');
      console.log('3. API 권한에 "상품" 조회 권한이 있는지 확인');
    }

  } catch (error: any) {
    console.error('❌ 에러 발생:', error.message);
    console.error(error);
  }
}

testNaverApiResponse();

