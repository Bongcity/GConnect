/**
 * Google Indexing API 클라이언트
 * 
 * 새 상품이 등록되거나 업데이트될 때 구글에 즉시 인덱싱 요청을 보냅니다.
 * 
 * 사용 전 필요한 설정:
 * 1. Google Cloud Console에서 프로젝트 생성
 * 2. Indexing API 활성화
 * 3. 서비스 계정 생성 및 JSON 키 다운로드
 * 4. Search Console에서 서비스 계정에 소유자 권한 부여
 * 5. 환경변수 설정:
 *    - GOOGLE_SERVICE_ACCOUNT_EMAIL: 서비스 계정 이메일
 *    - GOOGLE_PRIVATE_KEY: 서비스 계정 개인 키
 */

import { google } from 'googleapis';

// 환경변수에서 인증 정보 로드
const SCOPES = ['https://www.googleapis.com/auth/indexing'];
const INDEXING_API_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

interface IndexingResult {
  success: boolean;
  url: string;
  type: 'URL_UPDATED' | 'URL_DELETED';
  error?: string;
}

/**
 * Google Indexing API 인증 클라이언트 생성
 */
async function getAuthClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google 서비스 계정 인증 정보가 설정되지 않았습니다.');
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: SCOPES,
  });

  await auth.authorize();
  return auth;
}

/**
 * 단일 URL 인덱싱 요청
 * 
 * @param url - 인덱싱할 URL
 * @param type - 'URL_UPDATED' (업데이트/추가) 또는 'URL_DELETED' (삭제)
 */
export async function submitUrlForIndexing(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<IndexingResult> {
  try {
    const auth = await getAuthClient();
    
    const response = await fetch(INDEXING_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await auth.getAccessToken().then(t => t.token)}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    console.log(`[Google Indexing] ✅ ${type}: ${url}`);
    return { success: true, url, type };
  } catch (error: any) {
    console.error(`[Google Indexing] ❌ 실패 (${url}):`, error.message);
    return { success: false, url, type, error: error.message };
  }
}

/**
 * 여러 URL 일괄 인덱싱 요청
 * 
 * @param urls - 인덱싱할 URL 배열
 * @param type - 'URL_UPDATED' 또는 'URL_DELETED'
 * @param delayMs - 요청 간 지연 시간 (ms) - API 할당량 관리용
 */
export async function submitUrlsForIndexing(
  urls: string[],
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED',
  delayMs: number = 100
): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];

  for (const url of urls) {
    const result = await submitUrlForIndexing(url, type);
    results.push(result);

    // API 할당량 관리를 위한 지연
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`[Google Indexing] 완료: ${successCount}/${urls.length} 성공`);

  return results;
}

/**
 * 상품 URL 생성 헬퍼
 */
export function createProductIndexingUrl(
  productId: string,
  productName: string,
  baseUrl: string = 'https://www.gconnect.kr'
): string {
  const type = productId.startsWith('GLOBAL_') ? 'GLOBAL' : 'SELLER';
  const numericId = productId.replace(/^(GLOBAL_|SELLER_)/, '');
  
  // Slug 생성
  const slug = productName
    .trim()
    .replace(/[\s\(\)\/\[\]{}.,!?]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
    .replace(/-$/, '');

  return `${baseUrl}/products/${type}/${numericId}/${encodeURIComponent(slug)}`;
}

/**
 * Indexing API 설정 여부 확인
 */
export function isIndexingApiConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}

/**
 * 인덱싱 API 상태 확인
 */
export async function checkIndexingApiStatus(): Promise<{
  configured: boolean;
  authenticated: boolean;
  error?: string;
}> {
  const configured = isIndexingApiConfigured();
  
  if (!configured) {
    return { configured: false, authenticated: false };
  }

  try {
    await getAuthClient();
    return { configured: true, authenticated: true };
  } catch (error: any) {
    return { 
      configured: true, 
      authenticated: false, 
      error: error.message 
    };
  }
}

