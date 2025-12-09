# 네이버 API 연결 디버깅 가이드

## 🔍 에러 확인 방법

### 1. 브라우저 개발자 도구에서 확인

1. **F12** 또는 **우클릭 > 검사** 를 눌러 개발자 도구 열기
2. **Network** 탭 선택
3. **API 연결 테스트** 버튼 클릭
4. `/api/user/naver-api/test` 요청 클릭
5. **Response** 탭에서 에러 메시지 확인

#### 예상되는 에러 응답:

**Case 1: 토큰 발급 실패**
```json
{
  "error": "토큰 발급에 실패했습니다.",
  "details": "상태 코드: 401",
  "hint": "애플리케이션 ID와 시크릿을 다시 확인해주세요...",
  "response": {...}
}
```

**Case 2: 인증 에러 (401/403)**
```json
{
  "error": "애플리케이션 ID 또는 시크릿 키가 올바르지 않습니다.",
  "details": "상태 코드: 401",
  "hint": "네이버 커머스 API 센터에서 설정을 확인해주세요...",
  "failedAttempts": [...]
}
```

**Case 3: 엔드포인트 404**
```json
{
  "error": "API 엔드포인트를 찾을 수 없습니다.",
  "details": "모든 엔드포인트에서 404 오류가 발생했습니다.",
  "hint": "다음 사항을 확인해주세요...",
  "testedEndpoints": [...],
  "failedAttempts": [...]
}
```

**Case 4: 입력 값 검증 에러**
```json
{
  "error": "Client ID와 Client Secret을 입력해주세요."
}
```

### 2. 서버 로그 확인

서버 터미널에서 다음 로그를 확인하세요:

```bash
# PM2 사용 시
pm2 logs seller

# 또는 직접 실행 시
# 서버 콘솔에 출력되는 로그 확인
```

#### 예상되는 서버 로그:

```
🔍 네이버 커머스 API 연결 테스트 시작...
   Client ID: 4KbqV13RT...
🔑 OAuth 2.0 액세스 토큰 발급 중...
✅ 액세스 토큰 발급 성공!
🔍 API 엔드포인트 테스트 중...
🔍 Testing endpoint: https://api.commerce.naver.com/external/v1/products?page=1&size=1
   ℹ️ Status: 200 OK
   ✅ Success!
✅ API 연결 테스트 성공!
```

## 🔧 문제 해결 단계

### Step 1: 입력 값 확인
- [ ] Client ID에 공백이 없는지 확인
- [ ] Client Secret에 공백이 없는지 확인
- [ ] 복사/붙여넣기 시 앞뒤 공백 제거

### Step 2: 네이버 커머스 API 센터 확인

1. https://apicenter.commerce.naver.com 접속
2. 확인 사항:
   - [ ] 애플리케이션 상태가 **"승인됨"**
   - [ ] OAuth 2.0 Client-Credentials 방식 사용 중
   - [ ] **"상품" API가 선택**되어 있음
   - [ ] **API호출 IP에 서버 IP가 등록**되어 있음 ⚠️ 가장 중요!

### Step 3: 암호화 데이터 초기화 (ByteString 에러인 경우)

DB에서 직접 초기화:
```sql
UPDATE Users 
SET naverClientSecret = NULL
WHERE naverClientSecret IS NOT NULL;
```

그 후 설정 페이지에서 다시 입력

### Step 4: API 키 재발급

네이버 커머스 API 센터에서:
1. 기존 애플리케이션 삭제
2. 새 애플리케이션 생성
3. 새 키로 다시 테스트

## 📋 자주 발생하는 문제

### 1. "API 엔드포인트를 찾을 수 없습니다" (404)

**원인:**
- API 타입이 잘못 선택됨 (상품 API가 아님)
- API가 아직 승인되지 않음
- 네이버 API 엔드포인트가 변경됨

**해결:**
1. 커머스 API 센터에서 "상품" API 확인
2. 애플리케이션 승인 상태 확인
3. 새 애플리케이션으로 다시 시도

### 2. "애플리케이션 ID 또는 시크릿 키가 올바르지 않습니다" (401/403)

**원인:**
- 잘못된 키 입력
- API 호출 IP 미등록
- 키가 비활성화됨

**해결:**
1. 키 정확성 재확인
2. **서버 IP 주소를 API 센터에 등록** ⚠️
3. 애플리케이션 활성화 상태 확인

### 3. ByteString 암호화 에러

**원인:**
- DB에 저장된 암호화 데이터가 손상됨

**해결:**
```sql
-- DB에서 초기화
UPDATE Users SET naverClientSecret = NULL WHERE naverClientSecret IS NOT NULL;
```

## 🎯 디버깅 체크리스트

현재 상태 확인:

```
[ ] 브라우저 Network 탭에서 정확한 에러 메시지 확인
[ ] 서버 로그에서 상세 로그 확인
[ ] 네이버 커머스 API 센터 접속 가능
[ ] 애플리케이션 상태: "승인됨"
[ ] "상품" API 선택됨
[ ] API호출 IP 등록됨 (서버 IP)
[ ] Client ID 정확함 (공백 없음)
[ ] Client Secret 정확함 (공백 없음)
[ ] DB의 naverClientSecret 초기화됨
```

## 📞 추가 지원

위 단계로 해결되지 않을 경우:
1. 브라우저 Network 탭의 Response 전체 내용
2. 서버 로그 전체 내용
3. 네이버 커머스 API 센터 스크린샷

을 제공해주세요.

