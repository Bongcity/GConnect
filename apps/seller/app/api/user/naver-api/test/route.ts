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
    let { clientId, clientSecret } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID를 입력해주세요.' },
        { status: 400 }
      );
    }

    // clientSecret이 없으면 DB에서 불러오기
    if (!clientSecret || clientSecret.trim() === '') {
      console.log('🔑 DB에서 저장된 Client Secret 불러오는 중...');
      const { getDecryptedNaverApiKey } = await import('@/lib/naver-utils');
      const naverApiKey = await getDecryptedNaverApiKey(session.user.id);
      
      if (!naverApiKey || !naverApiKey.clientSecret) {
        return NextResponse.json(
          { error: '저장된 Client Secret이 없습니다. 먼저 설정을 저장해주세요.' },
          { status: 400 }
        );
      }
      
      clientSecret = naverApiKey.clientSecret;
      console.log('✅ DB에서 Client Secret 불러오기 성공');
    }

    // 네이버 커머스 API 테스트 호출
    // OAuth 2.0 방식으로 토큰 발급 후 API 테스트
    
    try {
      console.log('🔍 네이버 커머스 API 연결 테스트 시작...');
      console.log(`   Client ID: ${clientId.substring(0, 10)}...`);
      
      // 1단계: OAuth 2.0 토큰 발급 (bcrypt 전자서명 방식)
      console.log('🔑 OAuth 2.0 액세스 토큰 발급 중...');
      let accessToken = '';
      
      try {
        // bcrypt 전자서명 생성
        const bcrypt = await import('bcryptjs');
        const timestamp = Date.now().toString();
        const password = `${clientId}_${timestamp}`;
        
        console.log(`   timestamp: ${timestamp}`);
        console.log(`   password: ${password.substring(0, 30)}...`);
        
        // bcrypt 해싱 (salt로 client_secret 사용)
        const hashed = bcrypt.hashSync(password, clientSecret);
        
        // Base64 인코딩
        const clientSecretSign = Buffer.from(hashed).toString('base64');
        
        console.log(`   client_secret_sign: ${clientSecretSign.substring(0, 30)}...`);
        
        const tokenResponse = await fetch(
          'https://api.commerce.naver.com/external/v1/oauth2/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: clientId,
              timestamp: timestamp,
              client_secret_sign: clientSecretSign,
              grant_type: 'client_credentials',
              type: 'SELF',
            }),
          }
        );

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
          console.error('❌ 토큰 발급 실패:', tokenResponse.status, errorData);
          
          return NextResponse.json(
            { 
              error: '토큰 발급에 실패했습니다.',
              details: `상태 코드: ${tokenResponse.status}`,
              hint: '애플리케이션 ID와 시크릿을 다시 확인해주세요.\n' +
                    '1. 애플리케이션 ID가 정확한지 확인\n' +
                    '2. 애플리케이션 시크릿이 정확한지 확인 (공백 제거)\n' +
                    '3. 커머스 API 센터에서 API 사용 승인 여부 확인',
              response: errorData
            },
            { status: 400 }
          );
        }

        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;
        console.log('✅ 액세스 토큰 발급 성공!');
      } catch (tokenError: any) {
        console.error('❌ 토큰 발급 오류:', tokenError);
        return NextResponse.json(
          { 
            error: '토큰 발급 중 오류가 발생했습니다.',
            details: tokenError.message || String(tokenError),
          },
          { status: 500 }
        );
      }
      
      // 2단계: 발급받은 토큰으로 API 테스트
      console.log('🔍 API 엔드포인트 테스트 중...');
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
              'Authorization': `Bearer ${accessToken}`,
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
              hint: '네이버 커머스 API 센터에서 설정을 확인해주세요.\n' +
                    '1. API 사용 승인이 완료되었는지 확인\n' +
                    '2. 서버 IP가 등록되어 있는지 확인\n' +
                    '3. "상품" API가 활성화되어 있는지 확인',
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
                    '2. 서버 IP가 등록되어 있는지 확인\n' +
                    '3. 스마트스토어 센터에서 API 연동 상태 확인\n' +
                    '4. 상품이 등록되어 있는지 확인 (상품이 없으면 404 반환)',
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
        authMethod: 'OAuth 2.0'
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

