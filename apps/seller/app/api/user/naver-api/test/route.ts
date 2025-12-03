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
    // API Gateway 방식으로 상품 목록 조회 테스트
    
    try {
      // 여러 엔드포인트 시도
      const endpoints = [
        'https://api.commerce.naver.com/external/v1/products',
        'https://api.commerce.naver.com/external/v2/products',
        'https://api.commerce.naver.com/external/v1/product-origins',
        'https://api.commerce.naver.com/external/v1/categories',
      ];

      let apiResponse = null;
      let successEndpoint = null;

      for (const endpoint of endpoints) {
        console.log(`Testing endpoint: ${endpoint}`);
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-NCP-APIGW-API-KEY-ID': clientId,
              'X-NCP-APIGW-API-KEY': clientSecret,
            },
          });

          if (response.ok) {
            apiResponse = response;
            successEndpoint = endpoint;
            break;
          }
        } catch (e) {
          console.log(`Failed: ${endpoint}`, e);
          continue;
        }
      }

      if (!apiResponse) {
        // 마지막으로 기본 엔드포인트 시도
        apiResponse = await fetch('https://api.commerce.naver.com/external/v1/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-NCP-APIGW-API-KEY-ID': clientId,
            'X-NCP-APIGW-API-KEY': clientSecret,
          },
        });
      }

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        console.error('Naver API error:', apiResponse.status, errorData);
        console.error('Tested endpoint:', successEndpoint || 'All endpoints failed');
        
        // 일반적인 오류 처리
        if (apiResponse.status === 401 || apiResponse.status === 403) {
          return NextResponse.json(
            { 
              error: '애플리케이션 ID 또는 시크릿 키가 올바르지 않습니다.',
              details: `상태 코드: ${apiResponse.status}`,
              hint: '네이버 커머스 API 센터에서 키 정보를 다시 확인해주세요.'
            },
            { status: 400 }
          );
        }
        
        if (apiResponse.status === 404) {
          return NextResponse.json(
            { 
              error: 'API 엔드포인트를 찾을 수 없습니다.',
              details: '상품 API가 활성화되지 않았거나, API 타입이 다를 수 있습니다.',
              hint: '네이버 커머스 API 센터에서 "상품" API가 승인되었는지 확인해주세요.',
              testedEndpoints: endpoints
            },
            { status: 400 }
          );
        }

        throw new Error(errorData.message || `API 호출 실패 (${apiResponse.status})`);
      }

      const data = await apiResponse.json();
      
      // 상품 데이터 확인
      const productCount = data.products ? data.products.length : (data.contents ? data.contents.length : 0);

      return NextResponse.json({
        ok: true,
        message: `API 연결 테스트에 성공했습니다!`,
        endpoint: successEndpoint || 'default',
        productCount: productCount,
        dataKeys: Object.keys(data)
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

