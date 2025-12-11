# 가격 필드 수정 가이드

## 문제 상황

`sale_price`와 `discounted_sale_price`에 **같은 값**(할인가)이 저장되는 문제

### 기존 (잘못된 로직)
```typescript
const salePrice = channelProduct.discountedPrice || channelProduct.salePrice || 0;
// ❌ 이것은 "할인가"인데 변수명이 salePrice

price: salePrice,      // ❌ 할인가
salePrice: salePrice,  // ❌ 할인가
// 둘 다 같은 값!
```

### DB 저장
```typescript
sale_price: productData.price              // ❌ 할인가 저장 (원가여야 함)
discounted_sale_price: productData.salePrice  // ❌ 할인가 저장
```

**결과**: 두 컬럼에 모두 할인가가 저장됨

---

## 해결 방법

### 수정된 로직

```typescript
// 가격 정보 (네이버 API 필드)
// - salePrice: 판매가 (원가, 정가)
// - discountedPrice: 할인가 (실제 판매 가격)
const originalPrice = channelProduct.salePrice || 0;  // ✅ 원가
const discountedPrice = channelProduct.discountedPrice || channelProduct.salePrice || 0;  // ✅ 할인가

// 할인율 계산
const discountRate = originalPrice > 0 && discountedPrice < originalPrice
  ? parseFloat(((originalPrice - discountedPrice) / originalPrice * 100).toFixed(2))
  : 0;

// TransformedProduct 생성
const result: TransformedProduct = {
  price: originalPrice,        // ✅ 원가 → sale_price
  salePrice: discountedPrice,  // ✅ 할인가 → discounted_sale_price
  discountedRate: discountRate,  // ✅ 할인율 → discounted_rate
  // ...
};
```

### DB 저장 (변경 없음)
```typescript
sale_price: productData.price              // ✅ 원가 (originalPrice)
discounted_sale_price: productData.salePrice  // ✅ 할인가 (discountedPrice)
discounted_rate: productData.discountedRate   // ✅ 할인율
```

---

## 네이버 API 응답 구조

```json
{
  "channelProducts": [
    {
      "salePrice": 50000,        // 원가 (정가) ← sale_price
      "discountedPrice": 45000,  // 할인가 (실판가) ← discounted_sale_price
      // 할인율 = (50000 - 45000) / 50000 * 100 = 10%
    }
  ]
}
```

---

## 예시

### 할인 상품
```typescript
channelProduct.salePrice = 50000
channelProduct.discountedPrice = 45000

→ originalPrice = 50000     (원가)
→ discountedPrice = 45000   (할인가)
→ discountRate = 10         (할인율 10%)

DB 저장:
  sale_price = 50000
  discounted_sale_price = 45000
  discounted_rate = 10
```

### 할인 없는 상품
```typescript
channelProduct.salePrice = 30000
channelProduct.discountedPrice = null

→ originalPrice = 30000     (원가)
→ discountedPrice = 30000   (할인가 = 원가)
→ discountRate = 0          (할인율 0%)

DB 저장:
  sale_price = 30000
  discounted_sale_price = 30000
  discounted_rate = 0
```

---

## 테스트 방법

### 1. API 테스트
`https://seller.gconnect.kr/dashboard/settings` → **"API 연결 테스트"**

**응답 확인**:
```json
{
  "priceExample": {
    "salePrice": 50000,        // 원가
    "discountedPrice": 45000,  // 할인가
    "discountRate": 10,        // 할인율
    "explanation": {
      "salePrice": "원가 (정가) - sale_price 컬럼에 저장",
      "discountedPrice": "할인가 (실판가) - discounted_sale_price 컬럼에 저장",
      "discountRate": "할인율 (%) - discounted_rate 컬럼에 저장"
    }
  }
}
```

### 2. DB 확인
```sql
-- 가격 데이터 확인
SELECT 
    product_name,
    sale_price,              -- 원가 (정가)
    discounted_sale_price,   -- 할인가 (실판가)
    discounted_rate,         -- 할인율
    -- 계산 검증
    CASE 
        WHEN sale_price > discounted_sale_price 
        THEN CAST((sale_price - discounted_sale_price) * 100.0 / sale_price AS DECIMAL(10,2))
        ELSE 0 
    END AS calculated_rate
FROM 
    affiliate_products
WHERE 
    sale_price IS NOT NULL
ORDER BY 
    discounted_rate DESC;
```

### 3. 할인율 검증
```sql
-- sale_price와 discounted_sale_price가 같은지 확인
SELECT 
    COUNT(*) AS same_price_count,
    COUNT(CASE WHEN sale_price != discounted_sale_price THEN 1 END) AS different_price_count
FROM 
    affiliate_products
WHERE 
    sale_price IS NOT NULL 
    AND discounted_sale_price IS NOT NULL;
```

---

## 서버 적용

### 1. 코드 업데이트
```powershell
cd D:\GConnect
git pull origin main
```

### 2. 서버 재시작
```powershell
cd apps\seller
# Ctrl+C로 기존 종료 후
pnpm dev
```

### 3. 상품 재동기화
- `https://seller.gconnect.kr/dashboard/products` → **"네이버 상품 가져오기"**
- 또는 `https://seller.gconnect.kr/dashboard/settings` → **"지금 실행"**

**이제 올바른 가격 정보가 저장됩니다!**

---

## 참고 자료

### 네이버 커머스 API 응답 구조
- [원상품 정보 구조체](https://apicenter.commerce.naver.com/docs/commerce-api/current/schemas/%EC%9B%90%EC%83%81%ED%92%88-%EC%A0%95%EB%B3%B4-%EA%B5%AC%EC%A1%B0%EC%B2%B4)
- [스마트스토어 채널상품 정보 구조체](https://apicenter.commerce.naver.com/docs/commerce-api/current/schemas/%EC%8A%A4%EB%A7%88%ED%8A%B8%EC%8A%A4%ED%86%A0%EC%96%B4-%EC%B1%84%EB%84%90%EC%83%81%ED%92%88-%EC%A0%95%EB%B3%B4-%EA%B5%AC%EC%A1%B0%EC%B2%B4)

---

**작성일**: 2025-01-11
**커밋 ID**: (예정)

