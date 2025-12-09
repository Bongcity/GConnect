import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 네이버 커머스 API 연결 테스트
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { clientId, clientSecret } = body;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Client ID와 Client Secret을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 네이버 커머스 API 테스트 호출
    // NCP API Gateway 방식으로 상품 목록 조회 테스트
    
    try {
      console.log('🔍 네이버 커머스 API 연결 테스트 시작...');
      console.log(`   Client ID: ${clientId.substring(0, 10)}...`);
      
      // 여러 엔드포인트 시도
      const endpoints = [
        'https://api.commerce.naver.com/external/v1/products?page=1&size=1',
        'https://api.commerce.naver.com/external/v2/products?page=1&size=1',
        'https://api.commerce.naver.com/external/v1/product-origins?page=1&size=1',
        'https://api.commerce.naver.com/external/v1/categories',
      ];

      let apiResponse = null;
      let successEndpoint = null;
      const failedAttempts: Array<{endpoint: string, status: number, error: any}> = [];

      for (const endpoint of endpoints) {
        console.log(`🔍 Testing endpoint: ${endpoint}`);
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-NCP-APIGW-API-KEY-ID': clientId,
              'X-NCP-APIGW-API-KEY': clientSecret,
            },
          });

          console.log(`   ℹ️ Status: ${response.status} ${response.statusText}`);
          
          // 응답 본문 로깅
          const responseText = await response.text();
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          if (response.ok) {
            apiResponse = response;
            successEndpoint = endpoint;
            console.log(`   ✅ Success!`);
            
            // 성공한 응답을 다시 사용하기 위해 Response 객체 재생성
            apiResponse = new Response(responseText, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            });
            break;
          } else {
            console.log(`   ❌ Response: ${JSON.stringify(responseData).substring(0, 200)}`);
            failedAttempts.push({
              endpoint,
              status: response.status,
              error: responseData
            });
          }
        } catch (e) {
          console.log(`   ❌ Failed: ${e}`);
          failedAttempts.push({
            endpoint,
            status: 0,
            error: String(e)
          });
          continue;
        }
      }

      if (!apiResponse) {
        console.log('❌ 모든 엔드포인트 테스트 실패');
        
        // 모든 시도가 실패한 경우, 가장 유용한 에러 정보 반환
        const has404 = failedAttempts.some(a => a.status === 404);
        const has401or403 = failedAttempts.some(a => a.status === 401 || a.status === 403);
        
        if (has401or403) {
          const authError = failedAttempts.find(a => a.status === 401 || a.status === 403);
          return NextResponse.json(
            { 
              error: '애플리케이션 ID 또는 시크릿 키가 올바르지 않습니다.',
              details: `상태 코드: ${authError?.status}`,
              hint: '네이버 커머스 API 센터에서 키 정보를 다시 확인해주세요.\n' +
                    '1. 애플리케이션 ID와 시크릿이 정확한지 확인\n' +
                    '2. API 사용 승인이 완료되었는지 확인\n' +
                    '3. 서버 IP가 등록되어 있는지 확인',
              failedAttempts: failedAttempts
            },
            { status: 400 }
          );
        }
        
        if (has404) {
          return NextResponse.json(
            { 
              error: 'API 엔드포인트를 찾을 수 없습니다.',
              details: '모든 엔드포인트에서 404 오류가 발생했습니다.',
              hint: '다음 사항을 확인해주세요:\n' +
                    '1. 네이버 커머스 API 센터에서 "상품" API가 승인되었는지 확인\n' +
                    '2. API 타입이 올바른지 확인 (NCP API Gateway 방식)\n' +
                    '3. 네이버 개발자 센터에서 최신 API 문서 확인\n' +
                    '4. 스마트스토어 센터에서 API 연동 상태 확인',
              testedEndpoints: endpoints,
              failedAttempts: failedAttempts
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { 
            error: 'API 연결에 실패했습니다.',
            details: '모든 엔드포인트 테스트가 실패했습니다.',
            hint: '네이버 커머스 API 센터에서 설정을 확인해주세요.',
            failedAttempts: failedAttempts
          },
          { status: 400 }
        );
      }

      const data = await apiResponse.json();
      console.log('✅ API 연결 테스트 성공!');
      
      // 상품 데이터 확인
      const productCount = data.products ? data.products.length : (data.contents ? data.contents.length : 0);

      return NextResponse.json({
        ok: true,
        message: `✅ API 연결 테스트에 성공했습니다!`,
        successEndpoint: successEndpoint,
        productCount: productCount,
        dataKeys: Object.keys(data),
        authMethod: 'NCP API Gateway'
      });
      
    } catch (apiError: any) {
      console.error('Naver API test error:', apiError);
      
      // 네트워크 오류 등
      if (apiError.message.includes('fetch')) {
        return NextResponse.json(
          { error: '네이버 API 서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: apiError.message || 'API 테스트 중 오류가 발생했습니다.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('API test error:', error);
    return NextResponse.json(
      { error: 'API 연결 테스트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

