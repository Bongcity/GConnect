# 자동 동기화 수정 가이드

## 문제 상황

자동 동기화가 "성공"으로 로그되지만 **실제로 상품을 가져오지 못하는 문제**

### 증상
```
✅ 동기화 완료 - 사용자: xxx, 상태: SUCCESS, 소요시간: 500ms
```
- 동기화는 성공으로 표시됨
- 하지만 DB에 상품이 추가되지 않음
- 오류 로그도 없음

---

## 발견된 문제들

### 1. 암호화된 Client Secret을 복호화하지 않음 ❌

**코드 위치**: `apps/seller/lib/scheduler.ts` 292-295번 줄

**기존 (잘못됨)**:
```typescript
const naverClient = new NaverApiClient({
  clientId: user.naverClientId,
  clientSecret: user.naverClientSecret,  // ❌ 암호화된 값을 바로 사용
});
```

**문제**:
- DB에 저장된 `naverClientSecret`은 암호화되어 있음
- 암호화된 값을 API에 전달하면 인증 실패
- 하지만 에러가 try-catch에 잡혀서 "성공"으로 표시됨

**수정됨**:
```typescript
// 암호화된 Client Secret 복호화
const { decrypt } = await import('./crypto');
let decryptedSecret: string;

try {
  decryptedSecret = decrypt(user.naverClientSecret);
  if (!decryptedSecret) {
    throw new Error('Client Secret 복호화 실패');
  }
  console.log(`✅ Client Secret 복호화 성공`);
} catch (decryptError) {
  throw new Error('네이버 API 키 복호화에 실패했습니다.');
}

const naverClient = new NaverApiClient({
  clientId: user.naverClientId,
  clientSecret: decryptedSecret,  // ✅ 복호화된 값 사용
});
```

---

### 2. storeId 없이 transformNaverProduct 호출 ❌

**코드 위치**: `apps/seller/lib/scheduler.ts` 304번 줄

**기존 (잘못됨)**:
```typescript
const productData = transformNaverProduct(naverProduct);
// ❌ storeId와 detailData 파라미터 없음
```

**문제**:
- `transformNaverProduct(naverProduct, detailData?, storeId?)` 함수는 3개의 파라미터를 받음
- `storeId`가 없으면 URL이 `UNKNOWN_STORE`로 생성됨
- 상세 정보 없이 기본 정보만 저장됨

**수정됨**:
```typescript
// 1. 스토어 ID 조회
const storeId = await naverClient.getStoreId();

// 2. 상품별로 상세 정보 조회
const channelProductNo = naverProduct.channelProducts?.[0]?.channelProductNo;
let detailData = null;

if (channelProductNo) {
  detailData = await naverClient.getChannelProductDetail(channelProductNo.toString());
}

// 3. storeId와 detailData 함께 전달
const productData = transformNaverProduct(naverProduct, detailData, storeId);
```

---

### 3. 상세 정보를 조회하지 않음 ❌

**기존**:
- 기본 상품 목록만 조회 (`getAllProducts`)
- 상세 API 호출 없음
- 추가 이미지, 상세 설명 URL 등 누락

**수정됨**:
- 상품마다 상세 정보 조회 (`getChannelProductDetail`)
- 5개씩 배치 처리로 성능 최적화
- 상세 정보 실패 시에도 기본 정보는 저장

---

### 4. DB 저장 시 필드 매핑 불일치 ❌

**기존**:
```typescript
await prisma.product.update({
  where: { id: existingProduct.id },
  data: {
    ...productData,  // ❌ 스프레드로 전체 저장 (필드 불일치)
    lastSyncedAt: new Date(),
  },
});
```

**문제**:
- `productData`의 필드명과 DB 컬럼명이 다름
- 예: `productUrl` → `product_url`, `imageUrl` → `representative_product_image_url`

**수정됨**:
```typescript
await prisma.product.update({
  where: { id: existingProduct.id },
  data: {
    product_name: productData.name,
    sale_price: productData.price ? BigInt(productData.price) : null,
    discounted_sale_price: productData.salePrice ? BigInt(productData.salePrice) : null,
    discounted_rate: productData.discountedRate || null,
    representative_product_image_url: productData.imageUrl || null,
    product_url: productData.productUrl || null,
    product_description_url: productData.descriptionUrl || null,
    // ... 명시적 필드 매핑
  },
});
```

---

## 수정 요약

### Before (문제)
```typescript
async function syncProducts(userId: string, user: any) {
  // ❌ 암호화된 secret 그대로 사용
  const naverClient = new NaverApiClient({
    clientId: user.naverClientId,
    clientSecret: user.naverClientSecret,
  });

  // ❌ 기본 상품 목록만 조회
  const naverProducts = await naverClient.getAllProducts();

  for (const naverProduct of naverProducts) {
    // ❌ storeId와 detailData 없이 변환
    const productData = transformNaverProduct(naverProduct);
    
    // ❌ 필드 매핑 불일치
    await prisma.product.update({
      data: { ...productData },
    });
  }
}
```

### After (수정)
```typescript
async function syncProducts(userId: string, user: any) {
  // ✅ Client Secret 복호화
  const { decrypt } = await import('./crypto');
  const decryptedSecret = decrypt(user.naverClientSecret);
  
  const naverClient = new NaverApiClient({
    clientId: user.naverClientId,
    clientSecret: decryptedSecret,
  });

  // ✅ 스토어 ID 조회
  const storeId = await naverClient.getStoreId();

  // ✅ 기본 상품 목록 조회
  const naverProducts = await naverClient.getAllProducts();

  // ✅ 배치 처리 (5개씩)
  const BATCH_SIZE = 5;
  for (let i = 0; i < naverProducts.length; i += BATCH_SIZE) {
    const batch = naverProducts.slice(i, i + BATCH_SIZE);
    
    await Promise.all(
      batch.map(async (naverProduct) => {
        // ✅ 상세 정보 조회
        const channelProductNo = naverProduct.channelProducts?.[0]?.channelProductNo;
        const detailData = await naverClient.getChannelProductDetail(
          channelProductNo.toString()
        );

        // ✅ storeId와 detailData 함께 전달
        const productData = transformNaverProduct(naverProduct, detailData, storeId);
        
        // ✅ 명시적 필드 매핑
        await prisma.product.update({
          data: {
            product_name: productData.name,
            sale_price: productData.price ? BigInt(productData.price) : null,
            discounted_sale_price: productData.salePrice ? BigInt(productData.salePrice) : null,
            product_url: productData.productUrl || null,
            product_description_url: productData.descriptionUrl || null,
            // ...
          },
        });
      })
    );
  }
}
```

---

## 개선 사항

### 1. 자세한 로그 추가
```
✅ Client Secret 복호화 성공 (길이: 29)
🏪 스토어 ID 조회 중...
✅ 스토어 ID: kcmaker
📦 네이버 상품 목록 조회 중...
📊 조회된 상품 수: 10개
✅ 상품 생성: 키친메이커 프라이팬
✅ 상품 업데이트: 키친메이커 냄비
📊 진행 상황: 5/10
📊 진행 상황: 10/10
✅ 동기화 완료 - 총: 10, 성공: 10, 실패: 0
```

### 2. 에러 처리 강화
- Client Secret 복호화 실패 시 명확한 에러 메시지
- 상세 정보 조회 실패 시에도 기본 정보는 저장
- 상품별 에러는 전체 동기화를 중단하지 않음

### 3. 성능 최적화
- 상세 정보 조회를 5개씩 배치 처리
- 병렬 처리로 속도 향상

---

## 테스트 방법

### 1. 로그 확인
```powershell
# PM2 사용 시
pm2 logs scheduler

# 또는 직접 실행 시
cd D:\GConnect
pnpm scheduler
```

**정상 로그 예시**:
```
[Scheduler] 자동 동기화 시작 - 사용자: user123
✅ Client Secret 복호화 성공 (길이: 29)
🏪 스토어 ID 조회 중...
✅ 스토어 ID: kcmaker
📦 네이버 상품 목록 조회 중...
📊 조회된 상품 수: 10개
✅ 상품 생성: 상품1
✅ 상품 업데이트: 상품2
📊 진행 상황: 5/10
📊 진행 상황: 10/10
✅ 동기화 완료 - 총: 10, 성공: 10, 실패: 0
```

### 2. DB 확인
```sql
-- 최근 동기화 로그
SELECT TOP 10 
    syncType,
    status,
    itemsTotal,
    itemsSynced,
    itemsFailed,
    errorLog,
    createdAt
FROM SyncLogs
ORDER BY createdAt DESC;

-- 동기화된 상품 수 확인
SELECT COUNT(*) AS product_count
FROM affiliate_products
WHERE product_url LIKE 'https://smartstore.naver.com/kcmaker%';
```

### 3. 수동 동기화 테스트
```
https://seller.gconnect.kr/dashboard/settings → "지금 실행"
```

---

## 서버 적용

### 1. 코드 업데이트
```powershell
cd D:\GConnect
git pull origin main
```

### 2. 스케줄러 재시작
```powershell
# PM2 사용 시
pm2 restart scheduler

# 또는
pm2 restart all
```

### 3. 즉시 테스트
```powershell
# 스케줄러 로그 확인
pm2 logs scheduler --lines 100

# 또는 수동 동기화 실행
# 셀러 대시보드에서 "지금 실행" 버튼 클릭
```

---

## 문제 해결

### Q: 여전히 상품이 동기화되지 않음
**A**: 로그를 확인하세요:
```powershell
pm2 logs scheduler --lines 50
```

다음을 확인:
- `✅ Client Secret 복호화 성공` 메시지가 있는지
- `📊 조회된 상품 수: N개` 에서 N이 0보다 큰지
- 에러 메시지가 있는지

### Q: "Client Secret 복호화 실패" 에러
**A**: 
1. 셀러 대시보드 → 설정
2. 네이버 API 시크릿 다시 입력 및 저장
3. 스케줄러 재시작

### Q: "스토어 ID를 찾을 수 없습니다" 경고
**A**: 네이버 커머스 API 센터에서:
1. 채널 정보 API 활성화 확인
2. IP 등록 확인 (211.195.9.70)

---

**작성일**: 2025-01-11
**커밋 ID**: (예정)

