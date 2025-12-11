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
      
      // 2단계: 발급받은 토큰으로 상품 조회 API 테스트
      console.log('🔍 상품 조회 API 테스트 중...');
      console.log('   엔드포인트: POST /external/v1/products/search');
      
      try {
        const response = await fetch(
          'https://api.commerce.naver.com/external/v1/products/search',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              searchCondition: {
                productStatus: 'ON_SALE',
              },
              paging: {
                page: 1,
                size: 10,
              },
            }),
          }
        );

        console.log(`   ℹ️ Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }

         if (response.ok) {
           console.log(`   ✅ API 호출 성공!`);
           
           const totalCount = responseData.totalCount || 0;
           const productCount = responseData.products ? responseData.products.length : 0;
           
           console.log(`   📊 총 상품 수: ${totalCount}`);
           console.log(`   📦 조회된 상품: ${productCount}개`);

           // 3단계: 채널 정보 조회 (스토어 ID 확인)
           console.log('🏪 채널 정보 조회 중...');
           let channelInfo = null;
           let storeId = 'UNKNOWN_STORE';
           
           try {
             const channelResponse = await fetch(
               'https://api.commerce.naver.com/external/v1/seller/channels',
               {
                 method: 'GET',
                 headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${accessToken}`,
                 },
               }
             );
             
             if (channelResponse.ok) {
               channelInfo = await channelResponse.json();
               console.log('🏪 채널 정보:', JSON.stringify(channelInfo, null, 2));
               
               // 채널 정보에서 스토어 ID 추출
               if (channelInfo && Array.isArray(channelInfo) && channelInfo.length > 0) {
                 const firstChannel = channelInfo[0];
                 
                 // URL에서 스토어 ID 추출: https://smartstore.naver.com/kcmaker → kcmaker
                 if (firstChannel.url) {
                   const urlMatch = firstChannel.url.match(/smartstore\.naver\.com\/([^\/\?]+)/);
                   if (urlMatch && urlMatch[1]) {
                     storeId = urlMatch[1];
                   }
                 }
                 
                 // URL 추출 실패 시 다른 필드 시도
                 if (storeId === 'UNKNOWN_STORE') {
                   storeId = firstChannel.channelId 
                     || firstChannel.storeId 
                     || firstChannel.channelServiceId
                     || firstChannel.serviceChannelId
                     || firstChannel.smartStoreId
                     || firstChannel.name
                     || 'UNKNOWN_STORE';
                 }
                 
                 console.log('✅ 스토어 ID 추출:', storeId);
                 console.log('📋 채널 정보:', {
                   name: firstChannel.name,
                   url: firstChannel.url,
                   channelNo: firstChannel.channelNo,
                   channelType: firstChannel.channelType
                 });
               }
             } else {
               console.warn('⚠️ 채널 정보 조회 실패:', channelResponse.status);
             }
           } catch (channelError) {
             console.error('❌ 채널 정보 조회 오류:', channelError);
           }
           
           // 4단계: 상품 상세 정보 구조 확인 (상품이 있는 경우)
           let detailContentInfo = null;
           if (responseData.products && responseData.products.length > 0) {
             const firstProduct = responseData.products[0];
             const channelProductNo = firstProduct.channelProducts?.[0]?.channelProductNo;
             
             if (channelProductNo) {
               console.log('📝 상품 상세 정보 구조 확인 중...');
               console.log('   상품 기본 구조:', {
                 originProductNo: firstProduct.originProductNo,
                 channelProductNo: channelProductNo,
                 hasDetailContent: !!firstProduct.channelProducts?.[0]?.detailContent,
                 detailContentType: typeof firstProduct.channelProducts?.[0]?.detailContent
               });
               
               // detailContent 필드 확인
               const channelProduct = firstProduct.channelProducts[0];
               if (channelProduct.detailContent) {
                 console.log('   📄 detailContent 구조:', {
                   type: typeof channelProduct.detailContent,
                   hasUrl: !!channelProduct.detailContent?.url,
                   url: channelProduct.detailContent?.url,
                   length: typeof channelProduct.detailContent === 'string' 
                     ? channelProduct.detailContent.length 
                     : 'N/A'
                 });
                 
                 detailContentInfo = {
                   type: typeof channelProduct.detailContent,
                   hasUrl: !!channelProduct.detailContent?.url,
                   url: channelProduct.detailContent?.url,
                   hasDetailContentUrl: !!channelProduct.detailContentUrl,
                   detailContentUrl: channelProduct.detailContentUrl,
                   hasPcDetailContent: !!channelProduct.pcDetailContent,
                   pcDetailContentUrl: channelProduct.pcDetailContent?.url
                 };
               }
             }
           }

           return NextResponse.json({
             ok: true,
             message: `✅ 네이버 커머스 API 연결 성공!`,
             endpoint: 'POST /external/v1/products/search',
             totalProducts: totalCount,
             retrievedProducts: productCount,
             authMethod: 'OAuth 2.0 (bcrypt)',
             channelInfo: channelInfo,
             storeId: storeId,
             detailContentInfo: detailContentInfo,
             urls: {
               productUrl: storeId !== 'UNKNOWN_STORE' && responseData.products?.[0]?.channelProducts?.[0]?.channelProductNo
                 ? `https://smartstore.naver.com/${storeId}/products/${responseData.products[0].channelProducts[0].channelProductNo}`
                 : undefined,
               productDescriptionUrl: storeId !== 'UNKNOWN_STORE' && responseData.products?.[0]?.channelProducts?.[0]?.channelProductNo
                 ? detailContentInfo?.url || `https://smartstore.naver.com/${storeId}/products/${responseData.products[0].channelProducts[0].channelProductNo}#DETAIL`
                 : undefined
             },
             hint: productCount === 0 ? 
               '⚠️ 상품이 0개입니다. 스마트스토어에 "판매중" 상태의 상품이 있는지 확인해주세요.' : 
               '✅ 상품 데이터가 정상적으로 조회되었습니다!'
           });
        } else {
          console.log(`   ❌ API 호출 실패`);
          console.log(`   응답: ${JSON.stringify(responseData).substring(0, 300)}`);
          
          if (response.status === 401 || response.status === 403) {
            return NextResponse.json(
              { 
                error: 'API 인증 실패',
                details: `상태 코드: ${response.status}`,
                hint: '1. 애플리케이션 ID/시크릿 확인\n' +
                      '2. API 사용 승인 여부 확인\n' +
                      '3. 서버 IP(211.195.9.70) 등록 확인',
                response: responseData
              },
              { status: 400 }
            );
          }
          
          if (response.status === 404) {
            return NextResponse.json(
              { 
                error: 'API 엔드포인트 없음',
                details: '상품 조회 API를 찾을 수 없습니다.',
                hint: '1. "상품" API 활성화 확인\n' +
                      '2. 스마트스토어 상품 등록 확인\n' +
                      '3. API 센터 승인 상태 확인',
                response: responseData
              },
              { status: 400 }
            );
          }
          
          return NextResponse.json(
            { 
              error: 'API 호출 실패',
              details: `상태 코드: ${response.status}`,
              response: responseData
            },
            { status: 400 }
          );
        }
      } catch (apiTestError: any) {
        console.error('   ❌ API 테스트 오류:', apiTestError);
        return NextResponse.json(
          { 
            error: 'API 테스트 중 오류 발생',
            details: apiTestError.message || String(apiTestError),
          },
          { status: 500 }
        );
      }
      
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

