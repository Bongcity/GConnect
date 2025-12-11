# 구글 서치콘솔 연동 가이드

## 개요

네이버 API로 등록된 셀러 상품을 구글 검색에 노출시키기 위한 SEO 설정 가이드입니다.

## 구현된 기능

### 1. 동적 사이트맵 (sitemap.xml)

**파일**: `apps/product/app/sitemap.ts`

- 정적 페이지 (홈, 상품 목록, 검색)
- 동적 상품 페이지 (셀러 상품)
- 카테고리 페이지

**URL**: `https://www.gconnect.kr/sitemap.xml`

### 2. robots.txt

**파일**: `apps/product/app/robots.ts`

- Googlebot 허용 설정
- API 경로 차단
- 사이트맵 위치 명시

**URL**: `https://www.gconnect.kr/robots.txt`

### 3. JSON-LD 구조화된 데이터

**파일**: `apps/product/components/products/ProductDetail.tsx`

Schema.org 표준에 따른 구조화된 데이터:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "상품명",
  "image": ["이미지 URL"],
  "description": "설명",
  "brand": { "@type": "Brand", "name": "브랜드명" },
  "offers": {
    "@type": "Offer",
    "price": 가격,
    "priceCurrency": "KRW",
    "availability": "https://schema.org/InStock"
  }
}
```

### 4. Google Indexing API (선택)

**파일**: `apps/product/lib/google-indexing.ts`

새 상품 등록 시 구글에 즉시 인덱싱 요청을 보내는 기능.

---

## 구글 서치콘솔 설정 (수동)

### 1단계: Search Console 접속

1. https://search.google.com/search-console 접속
2. Google 계정으로 로그인
3. `www.gconnect.kr` 속성 선택

### 2단계: 사이트맵 제출

1. 왼쪽 메뉴 → **색인** → **Sitemaps**
2. 새 사이트맵 추가: `sitemap.xml`
3. **제출** 클릭

제출 후 상태가 "성공"으로 표시되어야 합니다.

### 3단계: URL 검사 및 색인 요청

1. 왼쪽 메뉴 → **URL 검사**
2. 상품 URL 입력 (예: `https://www.gconnect.kr/products/SELLER/12345/상품명`)
3. **색인 생성 요청** 클릭

### 4단계: 실적 모니터링

1. 왼쪽 메뉴 → **실적**
2. 확인 항목:
   - 총 클릭수
   - 총 노출수
   - 평균 CTR
   - 평균 게재순위

---

## Google Indexing API 설정 (선택)

새 상품이 등록될 때 자동으로 구글에 인덱싱을 요청하려면:

### 1단계: Google Cloud 프로젝트 설정

1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스** → **라이브러리**
4. "Indexing API" 검색 및 활성화

### 2단계: 서비스 계정 생성

1. **API 및 서비스** → **사용자 인증 정보**
2. **사용자 인증 정보 만들기** → **서비스 계정**
3. 서비스 계정 이름 입력 (예: `gconnect-indexing`)
4. JSON 키 다운로드

### 3단계: Search Console 권한 부여

1. https://search.google.com/search-console 접속
2. **설정** → **사용자 및 권한**
3. **사용자 추가**
4. 서비스 계정 이메일 입력 (예: `gconnect-indexing@project-id.iam.gserviceaccount.com`)
5. 권한: **소유자**

### 4단계: 환경변수 설정

`.env.local` 파일에 추가:

```env
# Google Indexing API
GOOGLE_SERVICE_ACCOUNT_EMAIL=gconnect-indexing@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 5단계: 사용법

```typescript
import { 
  submitUrlForIndexing, 
  createProductIndexingUrl,
  isIndexingApiConfigured 
} from '@/lib/google-indexing';

// 설정 확인
if (isIndexingApiConfigured()) {
  // 단일 URL 인덱싱
  const url = createProductIndexingUrl(product.id, product.productName);
  await submitUrlForIndexing(url, 'URL_UPDATED');
}
```

---

## API 할당량

### Indexing API

- 일일 한도: 200건 (기본)
- 분당 한도: 600건

### 사이트맵

- 최대 50,000개 URL
- 최대 50MB 크기
- 5000개 이상 시 sitemap index 사용 권장

---

## 예상 일정

| 작업 | 예상 시간 |
|------|----------|
| 사이트맵 제출 후 첫 크롤링 | 1-3일 |
| 검색 결과 노출 시작 | 1-2주 |
| 리치 스니펫 표시 | 2-4주 |
| Indexing API 사용 시 노출 | 24-48시간 |

---

## 문제 해결

### 사이트맵이 읽히지 않는 경우

1. `https://www.gconnect.kr/sitemap.xml` 직접 접속 확인
2. robots.txt에서 sitemap 경로 확인
3. 서버 응답 코드 확인 (200 OK)

### 색인이 생성되지 않는 경우

1. URL 검사 도구로 페이지 상태 확인
2. "크롤링됨 - 현재 색인이 생성되지 않음" 상태 확인
3. 페이지 품질 및 중복 콘텐츠 확인

### JSON-LD 오류

1. https://search.google.com/test/rich-results 에서 테스트
2. 필수 필드 누락 확인
3. 가격, 재고 정보 정확성 확인

---

## 관련 파일

- `apps/product/app/sitemap.ts` - 사이트맵 생성
- `apps/product/app/robots.ts` - robots.txt
- `apps/product/components/products/ProductDetail.tsx` - JSON-LD
- `apps/product/lib/google-indexing.ts` - Indexing API

---

**2025-12-11 작성**

