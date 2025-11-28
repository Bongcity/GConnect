# 데이터베이스 스키마 정렬 계획

## 🎯 **목표**

**DDRo DB를 기준**으로 GCONNECT DB의 구조를 맞춥니다.

---

## 📊 **DDRo DB 구조 (기준)**

### **서버 정보**
- **호스트**: 59.23.231.197:14103
- **데이터베이스**: DDRo
- **사용자**: 1stplatfor_sql
- **용도**: 네이버 스마트스토어 GLOBAL 상품 데이터

### **주요 테이블**

#### 1. **affiliate_products** (상품 테이블)
네이버 스마트스토어 제휴 상품 정보

**주요 컬럼**:
- `productId` - 상품 ID
- `productName` - 상품명
- `productUrl` - 상품 URL
- `price` / `salePrice` - 가격 정보
- `imageUrl` / `thumbnailUrl` - 이미지
- **`category1`, `category2`, `category3`, `category4`** - 네이버 카테고리 체계 (최대 4단계)
- `storeId` / `storeName` - 상점 정보
- `description` - 상품 설명
- `stockQuantity` - 재고
- `isActive` - 활성화 상태
- `rank` - 랭킹
- `reviewCount` / `rating` - 리뷰 정보

#### 2. **NaverCategories** (카테고리 테이블)
네이버 카테고리 계층 구조

**주요 컬럼**:
- `categoryId` - 카테고리 ID
- `categoryName` - 카테고리명
- `parentCategoryId` - 부모 카테고리 ID
- `depth` - 깊이 (1, 2, 3, 4단계)
- `fullPath` - 전체 경로

#### 3. **NaverShoppingKeywords** (키워드 테이블)
네이버 쇼핑 검색 키워드 정보

**주요 컬럼**:
- `keyword` - 키워드
- `searchVolume` - 검색량
- `competition` - 경쟁도

#### 4. **NaverCollectionProgress** (수집 진행 상태)
데이터 수집 작업 진행 상태

**주요 컬럼**:
- `collectionType` - 수집 유형
- `status` - 상태
- `totalItems` / `processedItems` - 진행률
- `errorCount` - 오류 개수

---

## 🔄 **GCONNECT DB 구조 변경 계획**

### **변경 사항**

#### 1. **Products 테이블 수정**
DDRo의 `affiliate_products` 구조에 맞춤

**추가할 컬럼**:
- `category4` - 4단계 카테고리 추가
- `rank` - 상품 랭킹
- `reviewCount` - 리뷰 개수  
- `rating` - 평점
- `storeId` - 상점 ID (기존 userId와 별도)
- `storeName` - 상점명 (기존 user.shopName을 컬럼으로)

**컬럼 이름 통일**:
- `name` → `productName`으로 변경 고려 (또는 그대로 유지하고 매핑만)

#### 2. **카테고리 테이블 추가**
DDRo와 동일한 카테고리 관련 테이블 생성:
- `NaverCategories` - GCONNECT에도 동일 구조로 추가
- `NaverShoppingKeywords` - 키워드 관리용
- `NaverCollectionProgress` - 수집 상태 관리용

---

## 🔗 **통합 전략**

### **1. UnifiedProduct 타입**
양쪽 DB의 상품을 하나의 인터페이스로 통합

```typescript
interface UnifiedProduct {
  // 공통 필드
  id: string;  // SELLER: UUID, GLOBAL: number → string 변환
  source: 'SELLER' | 'GLOBAL';
  
  // 상품 정보
  productName: string;
  description: string | null;
  productUrl: string | null;
  
  // 가격
  price: number;
  salePrice: number | null;
  
  // 이미지
  imageUrl: string | null;
  thumbnailUrl: string | null;
  
  // 카테고리 (4단계까지 지원)
  category1: string | null;
  category2: string | null;
  category3: string | null;
  category4: string | null;
  
  // 상점
  storeId: string | null;
  storeName: string | null;
  
  // 메타
  stockQuantity: number | null;
  isActive: boolean;
  rank: number | null;
  reviewCount: number | null;
  rating: number | null;
  
  // 타임스탬프
  createdAt: Date;
  updatedAt: Date;
}
```

### **2. 데이터 변환 함수**
```typescript
// SELLER (GCONNECT) → UnifiedProduct
function transformSellerProduct(product: Product): UnifiedProduct

// GLOBAL (DDRo) → UnifiedProduct  
function transformGlobalProduct(product: AffiliateProduct): UnifiedProduct
```

---

## 📝 **마이그레이션 단계**

### **Phase 1: DDRo 스키마 확정** ✅
1. DDRo DB의 실제 테이블 구조 확인
2. Prisma schema-ddro.prisma 작성
3. DDRo Prisma Client 생성

### **Phase 2: GCONNECT 스키마 수정** (다음 단계)
1. Products 테이블에 컬럼 추가 (`category4`, `rank`, `reviewCount`, `rating`, `storeId`, `storeName`)
2. 카테고리 관련 테이블 추가 (`NaverCategories`, `NaverShoppingKeywords`, `NaverCollectionProgress`)
3. Prisma migration 생성 및 적용

### **Phase 3: 코드 업데이트**
1. `UnifiedProduct` 타입 업데이트
2. 변환 함수 수정
3. UI 컴포넌트에서 4단계 카테고리, 리뷰, 랭킹 표시

---

## ⚠️ **주의사항**

1. **기존 데이터 보존**: Products 테이블에 컬럼 추가 시 기존 데이터 유지
2. **기본값 설정**: 새 컬럼들은 NULL 허용 또는 기본값 설정
3. **점진적 마이그레이션**: 한 번에 모든 것을 변경하지 않고 단계별로 진행
4. **하위 호환성**: 기존 코드가 계속 작동하도록 보장

---

## 📅 **다음 작업**

1. ✅ DDRo 스키마 작성 완료
2. ⏳ GCONNECT 스키마 마이그레이션 생성
3. ⏳ UnifiedProduct 타입 업데이트
4. ⏳ UI 업데이트 (4단계 카테고리, 리뷰, 랭킹)

