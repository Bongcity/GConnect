# SELLER + GLOBAL 상품 시스템

## 개요

GConnect 상품 사이트는 두 종류의 상품을 통합하여 제공합니다:

1. **SELLER 상품**: GCONNECT에 구독/결제한 파트너 스토어의 상품 (21.195.9.70 GCONNECT DB)
2. **GLOBAL 상품**: 네이버 스마트스토어 전체 상품 (59.23.231.197,14103 DDRo DB)

**핵심 정책**: SELLER 상품을 우선 노출하고, 부족분을 GLOBAL 상품으로 채웁니다.

---

## 데이터베이스 구성

### SELLER 상품 (GCONNECT DB)
- **서버**: 21.195.9.70
- **데이터베이스**: GCONNECT
- **테이블**: `Products`
- **Prisma Client**: `prisma` (기존)
- **특징**: GCONNECT에 입점한 검증된 파트너 스토어 상품

### GLOBAL 상품 (DDRo DB)
- **서버**: 59.23.231.197,14103
- **데이터베이스**: DDRo
- **사용자**: 1stplatfor_sql
- **비밀번호**: @allin#am1071
- **테이블**: `affiliate_products`
- **Prisma Client**: `ddroPrisma` (신규)
- **특징**: 네이버 스마트스토어 전체 상품 데이터

---

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# GCONNECT 메인 DB (SELLER 상품)
DATABASE_URL="sqlserver://21.195.9.70;database=GCONNECT;user=YOUR_USER;password=YOUR_PASSWORD;encrypt=false;trustServerCertificate=true"

# DDRo 외부 DB (GLOBAL 상품)
DDRO_DATABASE_URL="sqlserver://59.23.231.197,14103;database=DDRo;user=1stplatfor_sql;password=@allin#am1071;encrypt=false;trustServerCertificate=true"
```

---

## 파일 구조

```
packages/db/
├── prisma/
│   ├── schema.prisma          # GCONNECT DB 스키마 (SELLER 상품)
│   └── schema-ddro.prisma     # DDRo DB 스키마 (GLOBAL 상품)
├── src/
│   └── ddro.ts                # DDRo Prisma Client
└── index.ts                   # 통합 export

apps/product/
├── types/
│   └── product.ts             # UnifiedProduct 타입 정의 및 변환 함수
├── lib/
│   └── products.ts            # 상품 조회 헬퍼 함수
└── components/
    ├── home/
    │   └── FeaturedProducts.tsx    # SELLER/GLOBAL 섹션 분리
    ├── products/
    │   ├── ProductCard.tsx          # UnifiedProduct 지원
    │   └── ProductList.tsx          # 통합 상품 목록
    └── search/
        └── SearchResults.tsx        # 통합 검색 결과
```

---

## 핵심 함수

### 1. `getComposedProducts()`

SELLER와 GLOBAL 상품을 통합 조회하는 핵심 함수입니다.

```typescript
import { getComposedProducts } from '@/lib/products';

// 기본 사용
const result = await getComposedProducts({
  pageSize: 40,
});

// 검색
const result = await getComposedProducts({
  keyword: '아몬드',
  pageSize: 20,
});

// 카테고리 필터
const result = await getComposedProducts({
  category: '식품',
  pageSize: 40,
});
```

**반환값**:
```typescript
{
  sellerProducts: UnifiedProduct[];  // SELLER 상품 배열
  globalProducts: UnifiedProduct[];  // GLOBAL 상품 배열 (부족분만)
  combined: UnifiedProduct[];        // SELLER + GLOBAL 통합 배열
  total: {
    seller: number;                  // SELLER 전체 개수
    global: number;                  // GLOBAL 전체 개수
    combined: number;                // 전체 개수
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}
```

### 2. 노출 로직

```
예시 1) pageSize = 40, SELLER = 50개, GLOBAL = 1000개
→ SELLER 40개만 반환

예시 2) pageSize = 40, SELLER = 15개, GLOBAL = 1000개
→ SELLER 15개 + GLOBAL 25개 = 총 40개 반환

예시 3) pageSize = 40, SELLER = 0개, GLOBAL = 1000개
→ GLOBAL 40개 반환
```

---

## Prisma Client 생성

```bash
# 전체 생성
cd packages/db
pnpm generate

# GCONNECT DB만 생성
pnpm generate:main

# DDRo DB만 생성
pnpm generate:ddro
```

---

## UI 구성

### 홈 페이지 (FeaturedProducts)

- **SELLER 섹션**: "GCONNECT 파트너 스토어 상품" (있을 경우)
- **GLOBAL 섹션**: "네이버 스마트스토어 전체 상품" (부족분 또는 SELLER 없을 때)
- **안내 메시지**: SELLER가 없을 때 입점 예정 안내

### 전체 상품 페이지 (ProductList)

- SELLER + GLOBAL 통합 목록 표시
- 상단에 "파트너 X개 / 네이버 Y개" 배지 표시
- 정렬 옵션: 최신순, 낮은 가격순, 높은 가격순

### 검색 결과 (SearchResults)

- 검색 키워드에 대한 SELLER + GLOBAL 통합 결과
- 검색 결과 개수 표시 (파트너 X개, 네이버 Y개)

---

## 트러블슈팅

### DDRo DB 연결 실패

**증상**: GLOBAL 상품이 표시되지 않음

**확인사항**:
1. `.env.local` 파일에 `DDRO_DATABASE_URL` 설정 확인
2. DDRo 서버 접근 가능 여부 확인 (방화벽, IP 허용)
3. 터미널에서 연결 테스트:
   ```bash
   cd packages/db
   pnpm studio:ddro
   ```

**에러 처리**: 
- DDRo DB 실패 시 SELLER 상품만 표시 (서비스 중단 방지)
- Console에 에러 로그 출력

### SELLER DB 연결 실패

**증상**: 파트너 스토어 상품이 표시되지 않음

**확인사항**:
1. `.env.local` 파일에 `DATABASE_URL` 설정 확인
2. GCONNECT DB 접근 가능 여부 확인

**에러 처리**:
- SELLER DB 실패 시 GLOBAL 상품만 표시

---

## 타입 시스템

### UnifiedProduct

양쪽 DB의 상품을 통합한 인터페이스입니다:

```typescript
interface UnifiedProduct {
  id: string;              // "SELLER_{uuid}" 또는 "GLOBAL_{number}"
  source: 'SELLER' | 'GLOBAL';
  name: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  category1: string | null;
  category2: string | null;
  category3: string | null;
  shopName: string | null;
  storeId: string | null;
  productUrl: string | null;
  stockQuantity: number | null;
  isActive: boolean;
  reviewCount?: number | null;
  rating?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 변환 함수

- `transformSellerProduct()`: Product → UnifiedProduct
- `transformGlobalProduct()`: AffiliateProduct → UnifiedProduct

---

## 향후 개선 사항

### 1. 캐싱
- Redis를 활용한 상품 목록 캐싱
- SELLER 상품은 실시간, GLOBAL은 5분 캐싱 고려

### 2. 성능 최적화
- 쿼리 타임아웃 설정
- Connection pooling 최적화
- 인덱스 최적화

### 3. 고급 검색
- 다중 카테고리 필터
- 가격 범위 필터
- 평점 필터 (GLOBAL 상품용)

### 4. 분석
- SELLER vs GLOBAL 클릭률 분석
- 검색 키워드 분석
- 전환율 추적

---

## 주의사항

1. **ID 형식 유지**: 
   - SELLER 상품: `SELLER_{uuid}`
   - GLOBAL 상품: `GLOBAL_{number}`
   - ProductDetail 페이지에서 ID로 출처 구분

2. **에러 처리**:
   - 한쪽 DB 실패해도 다른 쪽은 정상 작동
   - 사용자에게 친화적인 오류 메시지

3. **성능**:
   - Promise.all()로 병렬 쿼리
   - 페이지네이션 적용
   - 불필요한 필드 제외 (select 활용)

4. **보안**:
   - DDRo DB 비밀번호는 환경 변수로만 관리
   - `.env.local` 파일은 git에 커밋 금지
