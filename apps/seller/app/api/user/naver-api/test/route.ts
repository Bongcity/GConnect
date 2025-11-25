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
    // 주의: 실제 네이버 커머스 API 엔드포인트는 네이버 문서를 참고하세요
    // 여기서는 간단한 인증 테스트만 수행합니다
    
    try {
      // 네이버 커머스 API는 OAuth 2.0을 사용합니다
      // 1. Access Token 발급 테스트
      const tokenResponse = await fetch('https://api.commerce.naver.com/external/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
          type: 'SELF',
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        
        // 일반적인 오류 처리
        if (tokenResponse.status === 401) {
          return NextResponse.json(
            { error: 'Client ID 또는 Client Secret이 올바르지 않습니다.' },
            { status: 400 }
          );
        }
        
        if (tokenResponse.status === 403) {
          return NextResponse.json(
            { error: 'API 사용 권한이 없습니다. 네이버 커머스 API 신청이 승인되었는지 확인해주세요.' },
            { status: 400 }
          );
        }

        throw new Error(errorData.message || 'API 호출에 실패했습니다.');
      }

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        return NextResponse.json({
          ok: true,
          message: 'API 연결 테스트에 성공했습니다!',
        });
      }

      throw new Error('Access Token을 받지 못했습니다.');
      
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

