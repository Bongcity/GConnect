/**
 * 네이버 커머스 API 테스트 스크립트
 * 상품 목록 조회 API를 테스트합니다.
 */

// 네이버 커머스 API 인증 정보
const NAVER_COMMERCE_CONFIG = {
  applicationId: '4KbqV13RTCuyfV95WDebVs',
  applicationSecret: '$2a$04$ZoPOOucB6lo1HxspiMs5be',
  baseUrl: 'https://api.commerce.naver.com',
};

/**
 * 네이버 커머스 API 호출을 위한 인증 헤더 생성
 */
function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-NCP-APIGW-API-KEY-ID': NAVER_COMMERCE_CONFIG.applicationId,
    'X-NCP-APIGW-API-KEY': NAVER_COMMERCE_CONFIG.applicationSecret,
  };
}

/**
 * 상품 목록 조회 테스트
 */
async function testGetProducts() {
  console.log('🔍 네이버 커머스 API - 상품 목록 조회 테스트 시작...\n');

  try {
    const url = `${NAVER_COMMERCE_CONFIG.baseUrl}/external/v1/products`;
    
    console.log('📡 API 호출 정보:');
    console.log('- URL:', url);
    console.log('- Application ID:', NAVER_COMMERCE_CONFIG.applicationId);
    console.log('- IP:', '211.195.9.70');
    console.log('\n');

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('📥 응답 상태:', response.status, response.statusText);
    console.log('\n');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 호출 실패:');
      console.error('- Status:', response.status);
      console.error('- Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API 호출 성공!');
    console.log('\n📦 응답 데이터:');
    console.log(JSON.stringify(data, null, 2));

    // 상품 수 출력
    if (data.products && Array.isArray(data.products)) {
      console.log(`\n📊 총 ${data.products.length}개의 상품이 조회되었습니다.`);
      
      // 첫 번째 상품 정보 출력
      if (data.products.length > 0) {
        console.log('\n🏷️ 첫 번째 상품 정보:');
        const firstProduct = data.products[0];
        console.log('- ID:', firstProduct.id);
        console.log('- 상품명:', firstProduct.name);
        console.log('- 가격:', firstProduct.salePrice);
      }
    }

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    if (error instanceof Error) {
      console.error('- 메시지:', error.message);
      console.error('- Stack:', error.stack);
    }
  }
}

/**
 * 특정 상품 조회 테스트
 */
async function testGetProductById(productId: string) {
  console.log(`\n🔍 네이버 커머스 API - 상품 상세 조회 테스트 (ID: ${productId})...\n`);

  try {
    const url = `${NAVER_COMMERCE_CONFIG.baseUrl}/external/v1/products/${productId}`;
    
    console.log('📡 API 호출:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('📥 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 호출 실패:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API 호출 성공!');
    console.log('\n📦 상품 상세 정보:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  }
}

/**
 * API 엔드포인트 목록 테스트
 */
async function testApiEndpoints() {
  console.log('🔍 네이버 커머스 API 엔드포인트 테스트\n');
  console.log('=' .repeat(60));

  const endpoints = [
    { name: '상품 목록 조회', path: '/external/v1/products' },
    { name: '상품 카테고리 조회', path: '/external/v1/categories' },
    { name: 'API 정보', path: '/external/v1/api-info' },
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📍 테스트: ${endpoint.name}`);
    console.log(`   경로: ${endpoint.path}`);
    
    try {
      const url = `${NAVER_COMMERCE_CONFIG.baseUrl}${endpoint.path}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log(`   ✅ 상태: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   📦 데이터:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
      } else {
        const error = await response.text();
        console.log(`   ❌ 에러:`, error.substring(0, 200));
      }
    } catch (error) {
      console.log(`   ❌ 요청 실패:`, error);
    }
    
    console.log('-'.repeat(60));
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     네이버 커머스 API 테스트                            ║');
  console.log('║     스토어: 키친메이커                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n');

  // 테스트 실행
  await testGetProducts();
  
  // 추가 엔드포인트 테스트
  console.log('\n\n');
  await testApiEndpoints();

  console.log('\n\n✅ 테스트 완료!\n');
}

// 스크립트 실행
main().catch(console.error);

