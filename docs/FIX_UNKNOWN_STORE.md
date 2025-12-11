# UNKNOWN_STORE → kcmaker 수정 가이드

## 문제 상황

### 1. `UNKNOWN_STORE` 문제
`affiliate_products` 테이블의 URL에 `UNKNOWN_STORE`가 들어가는 문제:
```
https://smartstore.naver.com/UNKNOWN_STORE/products/12344829833
```

### 2. 상세 정보 URL 문제
`product_description_url`에 상품 URL과 동일한 값이 들어가는 문제:
```sql
product_url = "https://smartstore.naver.com/kcmaker/products/12344829833"
product_description_url = "https://smartstore.naver.com/kcmaker/products/12344829833"
-- 👆 상세 정보로 직접 이동하는 앵커 링크가 필요
```

## 해결 방법

### 1단계: 서버 코드 업데이트 ✅ (완료)

```bash
cd D:\GConnect
git pull origin main
```

**수정된 내용**:
- `naver-api.ts`: `getStoreId()` 함수가 채널 API URL에서 스토어 ID 추출
- `test/route.ts`: 채널 정보 조회 및 스토어 ID 확인 로직 추가

### 2단계: 서버 재시작 (필수!)

```powershell
# Seller 앱 재시작
cd D:\GConnect\apps\seller

# 기존 실행 중이면 Ctrl+C로 종료 후
pnpm dev
```

### 3단계: 네이버 상품 재동기화

**방법 A**: 상품 관리 페이지
1. `https://seller.gconnect.kr/dashboard/products` 접속
2. **"네이버 상품 가져오기"** 버튼 클릭

**방법 B**: 설정 페이지
1. `https://seller.gconnect.kr/dashboard/settings` 접속
2. **"지금 실행"** 버튼 클릭

**결과**: 새로 가져오는 상품은 자동으로 올바른 URL로 저장됩니다!
```
product_url: https://smartstore.naver.com/kcmaker/products/12344829833
product_description_url: https://m.smartstore.naver.com/kcmaker/products/12344829833/shopping-connect-contents
```

**설명**:
- `product_url`: PC 상품 메인 페이지 (이미지, 가격, 구매 버튼 등)
- `product_description_url`: 모바일 상품 상세 정보 전용 페이지 (실제 네이버 형식)

### 4단계: 기존 데이터 수정 (선택 사항)

이미 `UNKNOWN_STORE`로 저장된 데이터를 수정하려면:

#### 옵션 A: SQL 스크립트 실행

```sql
-- 1. 확인 (실행 전)
SELECT id, product_name, product_url, product_description_url
FROM affiliate_products
WHERE product_url LIKE '%UNKNOWN_STORE%';

-- 2. 업데이트
UPDATE affiliate_products
SET product_url = REPLACE(product_url, 'UNKNOWN_STORE', 'kcmaker')
WHERE product_url LIKE '%UNKNOWN_STORE%';

UPDATE affiliate_products
SET product_description_url = REPLACE(product_description_url, 'UNKNOWN_STORE', 'kcmaker')
WHERE product_description_url LIKE '%UNKNOWN_STORE%';

-- 3. 확인 (실행 후)
SELECT COUNT(*) AS updated_count
FROM affiliate_products
WHERE product_url LIKE '%kcmaker%';
```

#### 옵션 B: 자동 스크립트 사용

```powershell
# SQL Server Management Studio에서 실행
# 파일: scripts/fix-unknown-store-urls.sql
```

## 확인 방법

### API 테스트로 확인
```bash
# 브라우저 콘솔에서
https://seller.gconnect.kr/dashboard/settings
→ "API 연결 테스트" 버튼 클릭
→ 응답에서 "storeId": "kcmaker" 확인
```

### DB에서 직접 확인
```sql
-- UNKNOWN_STORE가 남아있는지 확인
SELECT COUNT(*) 
FROM affiliate_products
WHERE product_url LIKE '%UNKNOWN_STORE%'
   OR product_description_url LIKE '%UNKNOWN_STORE%';
-- 결과: 0이면 성공!

-- kcmaker가 제대로 들어갔는지 확인
SELECT COUNT(*) 
FROM affiliate_products
WHERE product_url LIKE '%kcmaker%';
-- 결과: 상품 개수가 나오면 성공!
```

## 코드 변경 사항

### naver-api.ts - getStoreId()
```typescript
// 채널 정보 API 응답:
// [{ "url": "https://smartstore.naver.com/kcmaker", ... }]

// URL에서 스토어 ID 추출
const urlMatch = firstChannel.url.match(/smartstore\.naver\.com\/([^\/\?]+)/);
storeId = urlMatch[1]; // "kcmaker"
```

### sync/route.ts
```typescript
// 스토어 ID 먼저 조회
const storeId = await naverClient.getStoreId();
// → "kcmaker"

// 상품 변환 시 storeId 전달
transformNaverProduct(product, detailData, storeId);
```

### transformNaverProduct()
```typescript
// 상품 URL 생성 (PC 버전)
const productUrl = storeId && channelProductNo 
  ? `https://smartstore.naver.com/${storeId}/products/${channelProductNo}`
  : undefined;
// → "https://smartstore.naver.com/kcmaker/products/12344829833"

// 상세 정보 URL 생성 (모바일 버전 + shopping-connect-contents)
// 1순위: API에서 제공하는 상세 URL (거의 없음)
// 2순위: 모바일 스마트스토어 상세 정보 전용 URL (실제 네이버 형식) ⭐
// 3순위: 상품 URL과 동일 (fallback)
const descriptionUrl = channelProduct.detailContent?.url 
  || (storeId && channelProductNo
    ? `https://m.smartstore.naver.com/${storeId}/products/${channelProductNo}/shopping-connect-contents`
    : productUrl);
// → "https://m.smartstore.naver.com/kcmaker/products/12344829833/shopping-connect-contents"
```

## 트러블슈팅

### Q: 재동기화했는데도 여전히 UNKNOWN_STORE로 나옴
**A**: 서버를 재시작했는지 확인하세요. 코드 변경 후 반드시 재시작 필요!

### Q: 채널 정보 조회가 실패함
**A**: 네이버 API 키가 올바른지, OAuth 토큰 발급이 성공했는지 확인하세요.

### Q: 기존 데이터는 어떻게 수정하나요?
**A**: 위의 "4단계: 기존 데이터 수정" SQL 스크립트를 실행하세요.

### Q: 다른 스토어 ID가 필요한 경우
**A**: SQL 스크립트에서 'kcmaker'를 실제 스토어 ID로 변경하세요.

## 참고 자료

- 네이버 커머스 API 문서: https://apicenter.commerce.naver.com/docs/
- 채널 정보 조회 API: https://apicenter.commerce.naver.com/docs/commerce-api/current/get-channels-by-account-no-sellers

---

**작성일**: 2025-01-11
**최종 수정**: 2025-01-11
**커밋 ID**: e4fbb30

