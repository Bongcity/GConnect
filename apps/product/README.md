# GConnect Product Site

메인 상품 사이트 - 소비자들이 네이버 스마트스토어 상품을 검색하고 구매하는 사이트

## 🚀 시작하기

```bash
# 개발 서버 실행
cd apps/product
pnpm dev

# 포트: 3001
```

## 📦 주요 기능

### 1. 홈페이지
- 히어로 섹션
- 최신 상품 8개 표시
- 통계 카드 (등록 상품, 제휴 스토어, 실시간 업데이트)

### 2. 상품 목록 페이지
- 전체 상품 목록
- 정렬 (최신순/가격순)
- 페이지네이션 (20개씩)
- 카테고리 필터

### 3. 상품 상세 페이지
- 상품 이미지
- 상품 정보
- 가격 및 할인 정보
- 네이버 스마트스토어 구매 링크
- SEO 최적화 (JSON-LD)

### 4. 검색 기능
- 키워드 검색
- 상품명, 설명, 카테고리 검색
- 검색 결과 페이지네이션
- 정렬 옵션

### 5. SEO 최적화
- 동적 메타태그
- sitemap.xml 자동 생성
- robots.txt
- 구조화된 데이터 (JSON-LD)

## 🎨 디자인

- Tailwind CSS
- 다크 테마 (brand-navy 베이스)
- 글라스모피즘 디자인
- 반응형 레이아웃
- Framer Motion 애니메이션

## 📂 프로젝트 구조

```
apps/product/
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx             # 홈페이지
│   ├── globals.css          # 전역 CSS
│   ├── sitemap.ts           # 동적 사이트맵
│   ├── robots.ts            # robots.txt
│   ├── products/
│   │   ├── page.tsx         # 상품 목록
│   │   └── [id]/
│   │       └── page.tsx     # 상품 상세
│   └── search/
│       └── page.tsx         # 검색 결과
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # 헤더 (검색바)
│   │   └── Footer.tsx       # 푸터
│   ├── home/
│   │   ├── HeroSection.tsx  # 히어로 섹션
│   │   └── FeaturedProducts.tsx # 최신 상품
│   ├── products/
│   │   ├── ProductCard.tsx  # 상품 카드
│   │   ├── ProductList.tsx  # 상품 목록
│   │   └── ProductDetail.tsx # 상품 상세
│   └── search/
│       └── SearchResults.tsx # 검색 결과
└── lib/                     # 유틸리티 함수
```

## 🔗 URL 구조

- `/` - 홈페이지
- `/products` - 전체 상품 목록
- `/products?sort=latest` - 최신순 정렬
- `/products?sort=price_low` - 낮은 가격순
- `/products?sort=price_high` - 높은 가격순
- `/products?page=2` - 페이지네이션
- `/products/[id]` - 상품 상세
- `/search?q=키워드` - 검색
- `/sitemap.xml` - 사이트맵
- `/robots.txt` - robots.txt

## 🎯 SEO 전략

### 메타태그
- 동적 title/description
- Open Graph 태그
- Twitter 카드

### 구조화된 데이터
- Product Schema
- Organization Schema
- BreadcrumbList Schema

### 사이트맵
- 자동 생성
- 모든 상품 페이지 포함
- 업데이트 시간 포함

## 🚀 배포

### 환경 변수
```env
NEXT_PUBLIC_PRODUCT_URL=https://shop.gconnect.co.kr
```

### Vercel 배포
```bash
vercel --prod
```

## 📊 데이터베이스

- Prisma ORM
- MSSQL Server
- `@gconnect/db` 패키지 사용

### 쿼리 예시
```typescript
// 상품 조회
const products = await db.product.findMany({
  where: {
    isActive: true,
    isGoogleExposed: true,
  },
  include: {
    user: {
      select: {
        shopName: true,
      },
    },
  },
});
```

## 🎨 컴포넌트

### ProductCard
```tsx
<ProductCard product={product} />
```

### ProductList
```tsx
<ProductList searchParams={{ sort: 'latest', page: '1' }} />
```

### ProductDetail
```tsx
<ProductDetail product={product} />
```

## 📱 반응형

- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+

## 🌐 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 📄 라이선스

© 2024 GConnect. All rights reserved.

