import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer';

/**
 * 네이버 스마트스토어 상세 페이지 높이 측정 API
 * Puppeteer를 사용하여 실제 렌더링된 페이지의 정확한 높이 측정
 */

// 브라우저 인스턴스 재사용 (성능 최적화)
let browserInstance: Browser | null = null;

// 높이 캐시 (24시간 유지)
const heightCache = new Map<string, { height: number; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

async function getBrowser() {
  if (!browserInstance || !browserInstance.connected) {
    console.log('[measure-height] 새 브라우저 인스턴스 시작...');
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
  }
  return browserInstance;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // 캐시 확인
    const cached = heightCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[measure-height] 캐시된 높이 사용:', cached.height, 'px');
      return NextResponse.json({
        height: cached.height,
        cached: true,
        method: 'cache'
      });
    }

    console.log('[measure-height] Puppeteer로 실제 높이 측정 시작:', url);
    
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    // 더 큰 뷰포트 설정 (모바일 대신 데스크톱)
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 페이지 로드 (네트워크 대기)
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // JavaScript 실행 완료 대기 - 10초로 증가
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 페이지 끝까지 여러 번 스크롤하여 모든 lazy-loaded 콘텐츠 로드
    await page.evaluate(async () => {
      // 페이지를 여러 번 스크롤하여 모든 콘텐츠 로드
      for (let i = 0; i < 10; i++) {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
    
    // 추가 대기 (모든 이미지 로딩)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 실제 페이지 높이 측정
    const height = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
      return Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
    });
    
    await page.close();
    
    // 측정된 높이의 1.5배를 사용 (안전 마진)
    const finalHeight = Math.round(height * 1.5);
    
    // 캐시에 저장
    heightCache.set(url, { height: finalHeight, timestamp: Date.now() });
    
    console.log('[measure-height] ✅ 실제 렌더링 높이:', height, 'px');
    console.log('[measure-height] 최종 높이 (1.5배 안전 마진):', finalHeight, 'px');
    
    return NextResponse.json({
      height: finalHeight,
      actualHeight: height,
      method: 'puppeteer',
      success: true
    });
  } catch (error: any) {
    console.error('[measure-height] ❌ Puppeteer 에러:', error.message);
    
    // 실패 시 안전한 기본값
    return NextResponse.json({
      height: 10000,
      error: error.message,
      method: 'fallback'
    });
  }
}

