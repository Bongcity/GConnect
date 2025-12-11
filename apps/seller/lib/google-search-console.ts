/**
 * Google Search Console API 클라이언트
 * 
 * 상품 URL의 노출수, 클릭수를 조회하고 DB에 저장합니다.
 */

import { google } from 'googleapis';
import { prisma } from '@gconnect/db';

interface GSCMetrics {
  url: string;
  date?: string; // YYYY-MM-DD 형식
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

interface DateRange {
  start: Date;
  end: Date;
}

export class GoogleSearchConsoleClient {
  private searchConsole;
  private siteUrl = 'sc-domain:gconnect.kr'; // 도메인 속성
  private enabled = false;

  constructor() {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // 환경 변수 누락 체크
    if (!serviceAccountEmail || !privateKey) {
      console.error('[GSC] ❌ Google 서비스 계정 정보 누락:');
      console.error(`  - GOOGLE_SERVICE_ACCOUNT_EMAIL: ${serviceAccountEmail ? '✓ 설정됨' : '✗ 누락'}`);
      console.error(`  - GOOGLE_PRIVATE_KEY: ${privateKey ? '✓ 설정됨' : '✗ 누락'}`);
      console.error('[GSC] GSC 기능이 비활성화됩니다.');
      console.error('[GSC] .env.local 파일에 다음 변수를 추가하세요:');
      console.error('  GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com');
      console.error('  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
      return; // enabled = false
    }

    try {
      // 서비스 계정 이메일 형식 검증
      if (!serviceAccountEmail.includes('@') || !serviceAccountEmail.includes('.iam.gserviceaccount.com')) {
        throw new Error('잘못된 서비스 계정 이메일 형식입니다. @project.iam.gserviceaccount.com 형식이어야 합니다.');
      }

      // Private key 형식 검증
      if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
        throw new Error('잘못된 Private Key 형식입니다. PEM 형식이어야 합니다.');
      }

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccountEmail,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      });

      this.searchConsole = google.searchconsole({ version: 'v1', auth });
      this.enabled = true;
      console.log('[GSC] ✅ Google Search Console 클라이언트 초기화 완료');
      console.log(`[GSC]    서비스 계정: ${serviceAccountEmail}`);
      console.log(`[GSC]    사이트 URL: ${this.siteUrl}`);
    } catch (error: any) {
      console.error('[GSC] ❌ 초기화 실패:', error.message);
      console.error('[GSC] 환경 변수를 확인하세요:');
      console.error('  - GOOGLE_SERVICE_ACCOUNT_EMAIL: 형식이 올바른지 확인');
      console.error('  - GOOGLE_PRIVATE_KEY: PEM 형식이 올바른지 확인');
      console.error('[GSC] GSC 기능이 비활성화됩니다.');
    }
  }

  /**
   * GSC API가 활성화되어 있는지 확인
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 특정 URL 목록의 검색 지표를 조회 (날짜별)
   * 반환: Map<url, Map<date, metrics>>
   */
  async getUrlMetrics(
    productUrls: string[],
    startDate: string, // YYYY-MM-DD
    endDate: string    // YYYY-MM-DD
  ): Promise<Map<string, Map<string, GSCMetrics>>> {
    if (!this.enabled) {
      console.warn('[GSC] API가 비활성화되어 있습니다');
      return new Map();
    }

    try {
      console.log(`[GSC] 지표 조회 시작: ${productUrls.length}개 URL, ${startDate} ~ ${endDate}`);

      const response = await this.searchConsole.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['page', 'date'], // 날짜 차원 추가
          dimensionFilterGroups: productUrls.length > 0 ? [{
            filters: productUrls.map(url => ({
              dimension: 'page',
              expression: url,
              operator: 'equals',
            })),
          }] : undefined,
          rowLimit: 25000, // 최대값
        },
      });

      const metricsMap = new Map<string, Map<string, GSCMetrics>>();

      if (response.data.rows) {
        for (const row of response.data.rows) {
          const url = row.keys?.[0] || '';
          const date = row.keys?.[1] || '';
          
          if (!metricsMap.has(url)) {
            metricsMap.set(url, new Map());
          }
          
          metricsMap.get(url)!.set(date, {
            url,
            date,
            impressions: row.impressions || 0,
            clicks: row.clicks || 0,
            ctr: row.ctr || 0,
            position: row.position || 0,
          });
        }
      }

      const totalDataPoints = Array.from(metricsMap.values()).reduce(
        (sum, dateMap) => sum + dateMap.size, 
        0
      );
      console.log(`[GSC] ✅ ${metricsMap.size}개 URL, ${totalDataPoints}개 데이터 포인트 조회 완료`);
      return metricsMap;
    } catch (error: any) {
      console.error('[GSC] ❌ 지표 조회 실패:', error.message);
      if (error.response?.data) {
        console.error('[GSC] API 응답:', JSON.stringify(error.response.data, null, 2));
      }
      return new Map();
    }
  }

  /**
   * 모든 활성 상품의 검색 통계를 동기화 (최적화 버전)
   */
  async syncProductStats(dateRange: DateRange): Promise<void> {
    if (!this.enabled) {
      console.warn('[GSC] API가 비활성화되어 있어 동기화를 건너뜁니다');
      return;
    }

    const startTime = Date.now();
    console.log(`[GSC Sync] 시작: ${dateRange.start.toISOString()} ~ ${dateRange.end.toISOString()}`);

    try {
      // 1. 모든 활성 상품 조회
      const products = await prisma.product.findMany({
        where: { enabled: true },
        select: {
          id: true,
          product_name: true,
        },
      });

      console.log(`[GSC Sync] ${products.length}개 활성 상품 발견`);

      if (products.length === 0) {
        console.log('[GSC Sync] 활성 상품 없음 - 종료');
        return;
      }

      // 2. 상품 URL 목록 생성
      const baseUrl = process.env.NEXT_PUBLIC_PRODUCT_URL || 'https://www.gconnect.kr';
      const productUrls = products.map(p => {
        const slug = this.createSlug(p.product_name || '');
        return `${baseUrl}/products/SELLER/${p.id}/${encodeURIComponent(slug)}`;
      });

      // 3. 단일 API 호출로 전체 기간 데이터 가져오기
      const startDateStr = this.formatDate(dateRange.start);
      const endDateStr = this.formatDate(dateRange.end);
      
      console.log(`[GSC Sync] GSC API 호출: ${startDateStr} ~ ${endDateStr}`);
      const metrics = await this.getUrlMetrics(
        productUrls,
        startDateStr,
        endDateStr
      );

      // 4. 배치 데이터 수집
      const batchUpserts: Array<{
        productId: bigint;
        productUrl: string;
        date: Date;
        impressions: number;
        clicks: number;
      }> = [];

      for (const product of products) {
        const slug = this.createSlug(product.product_name || '');
        const productUrl = `${baseUrl}/products/SELLER/${product.id}/${encodeURIComponent(slug)}`;
        const urlMetrics = metrics.get(productUrl);
        
        if (urlMetrics) {
          for (const [dateStr, metric] of urlMetrics.entries()) {
            const date = new Date(dateStr);
            
            if (metric.impressions > 0 || metric.clicks > 0) {
              batchUpserts.push({
                productId: product.id,
                productUrl,
                date,
                impressions: metric.impressions,
                clicks: metric.clicks,
              });
            }
          }
        }
      }

      // 5. 배치 처리: 트랜잭션으로 한 번에 저장
      if (batchUpserts.length > 0) {
        console.log(`[GSC Sync] ${batchUpserts.length}개 레코드 배치 저장 중...`);
        
        await prisma.$transaction(
          batchUpserts.map(data =>
            prisma.googleSearchStat.upsert({
              where: {
                productId_date: {
                  productId: data.productId,
                  date: data.date,
                },
              },
              update: {
                impressions: data.impressions,
                clicks: data.clicks,
                productUrl: data.productUrl,
                updatedAt: new Date(),
              },
              create: data,
            })
          )
        );
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[GSC Sync] ✅ 완료: ${batchUpserts.length}개 레코드 저장 (${duration}초 소요, 1회 API 호출)`);
      } else {
        console.log(`[GSC Sync] ✅ 완료: 저장할 데이터 없음`);
      }
    } catch (error: any) {
      console.error('[GSC Sync] ❌ 동기화 실패:', error.message);
      throw error;
    }
  }

  /**
   * 재시도 로직이 포함된 동기화 (exponential backoff)
   */
  async syncProductStatsWithRetry(
    dateRange: DateRange,
    maxRetries = 3
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.syncProductStats(dateRange);
        return; // 성공 시 종료
      } catch (error: any) {
        console.error(`[GSC Sync] ❌ 시도 ${attempt}/${maxRetries} 실패:`, error.message);
        
        if (attempt < maxRetries) {
          const delaySeconds = Math.pow(2, attempt); // Exponential backoff: 2^1=2초, 2^2=4초
          console.log(`[GSC Sync] ⏳ ${delaySeconds}초 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        } else {
          console.error('[GSC Sync] ❌ 최대 재시도 횟수 초과');
          throw error;
        }
      }
    }
  }

  /**
   * 날짜를 YYYY-MM-DD 형식으로 변환
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 상품명으로 URL 슬러그 생성
   */
  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
}

// 싱글톤 인스턴스
let gscClientInstance: GoogleSearchConsoleClient | null = null;

export function getGSCClient(): GoogleSearchConsoleClient {
  if (!gscClientInstance) {
    gscClientInstance = new GoogleSearchConsoleClient();
  }
  return gscClientInstance;
}

