/**
 * Google Search Console API 클라이언트
 * 
 * 상품 URL의 노출수, 클릭수를 조회하고 DB에 저장합니다.
 */

import { google } from 'googleapis';
import { prisma } from '@gconnect/db';

interface GSCMetrics {
  url: string;
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
    try {
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!serviceAccountEmail || !privateKey) {
        console.warn('[GSC] ⚠️ Google 서비스 계정 정보 없음 - GSC 기능 비활성화');
        return;
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
    } catch (error: any) {
      console.error('[GSC] ❌ 초기화 실패:', error.message);
    }
  }

  /**
   * GSC API가 활성화되어 있는지 확인
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 특정 URL 목록의 검색 지표를 조회
   */
  async getUrlMetrics(
    productUrls: string[],
    startDate: string, // YYYY-MM-DD
    endDate: string    // YYYY-MM-DD
  ): Promise<Map<string, GSCMetrics>> {
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
          dimensions: ['page'],
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

      const metricsMap = new Map<string, GSCMetrics>();

      if (response.data.rows) {
        for (const row of response.data.rows) {
          const url = row.keys?.[0] || '';
          metricsMap.set(url, {
            url,
            impressions: row.impressions || 0,
            clicks: row.clicks || 0,
            ctr: row.ctr || 0,
            position: row.position || 0,
          });
        }
      }

      console.log(`[GSC] ✅ ${metricsMap.size}개 URL 지표 조회 완료`);
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
   * 모든 활성 상품의 검색 통계를 동기화
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

      // 3. 날짜별로 GSC 데이터 조회 및 저장
      const currentDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      let totalSaved = 0;

      while (currentDate <= endDate) {
        const dateStr = this.formatDate(currentDate);
        console.log(`[GSC Sync] ${dateStr} 데이터 처리 중...`);

        // GSC API 호출 (하루 단위)
        const metrics = await this.getUrlMetrics(
          productUrls,
          dateStr,
          dateStr
        );

        // DB에 저장
        for (const product of products) {
          const slug = this.createSlug(product.product_name || '');
          const productUrl = `${baseUrl}/products/SELLER/${product.id}/${encodeURIComponent(slug)}`;
          const metric = metrics.get(productUrl);

          if (metric && (metric.impressions > 0 || metric.clicks > 0)) {
            await prisma.googleSearchStat.upsert({
              where: {
                productId_date: {
                  productId: product.id,
                  date: currentDate,
                },
              },
              update: {
                impressions: metric.impressions,
                clicks: metric.clicks,
                productUrl,
                updatedAt: new Date(),
              },
              create: {
                productId: product.id,
                productUrl,
                date: currentDate,
                impressions: metric.impressions,
                clicks: metric.clicks,
              },
            });
            totalSaved++;
          }
        }

        // 다음 날짜로 이동
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[GSC Sync] ✅ 완료: ${totalSaved}개 레코드 저장 (${duration}초 소요)`);
    } catch (error: any) {
      console.error('[GSC Sync] ❌ 동기화 실패:', error.message);
      throw error;
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

