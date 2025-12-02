# 📧 이메일 알림 설정 가이드

GConnect의 자동 동기화 알림 기능을 사용하려면 이메일 발송 서비스를 설정해야 합니다.

## 🎯 Resend 설정 (추천)

### 1. Resend 계정 생성
1. https://resend.com 방문
2. 무료 계정 생성 (월 3,000통 무료)
3. 이메일 인증 완료

### 2. API 키 발급
1. Resend 대시보드에서 **API Keys** 메뉴 클릭
2. **Create API Key** 버튼 클릭
3. 이름 입력 (예: "GConnect Seller")
4. **Full Access** 권한 선택
5. 생성된 API 키 복사 (한 번만 표시됨!)

### 3. 환경 변수 설정

`apps/seller/.env.local` 파일에 추가:

```bash
# Resend API 키
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"

# 발신자 이메일 (기본값 사용 가능)
EMAIL_FROM="GConnect <noreply@gconnect.co.kr>"

# Seller 앱 URL
NEXT_PUBLIC_SELLER_URL="http://localhost:3003"
```

### 4. 도메인 인증 (선택사항)

**개발/테스트 환경:**
- 도메인 인증 없이도 Resend 제공 도메인으로 발송 가능
- 발신자: `onboarding@resend.dev`

**프로덕션 환경:**
1. Resend 대시보드에서 **Domains** 메뉴 클릭
2. **Add Domain** 클릭
3. 도메인 입력 (예: `gconnect.co.kr`)
4. DNS 레코드 추가:
   - SPF 레코드
   - DKIM 레코드
   - DMARC 레코드 (선택)
5. 인증 완료 후 `EMAIL_FROM`을 커스텀 도메인으로 변경

## 🔧 작동 방식

### 1. 알림 설정
1. Seller 로그인
2. **설정 > 자동 동기화** 메뉴
3. 알림 옵션 활성화:
   - ✅ 성공 시 알림 받기
   - ✅ 실패 시 알림 받기
4. 알림 이메일 주소 입력
5. 설정 저장

### 2. 자동 발송
- 자동 동기화 실행 시 설정에 따라 이메일 자동 발송
- 성공 시: 동기화 통계 포함
- 실패 시: 오류 내용 및 해결 방법 포함

### 3. 이메일 내용

**성공 이메일:**
```
✅ 동기화 완료

총 항목: 50개
동기화 성공: 48개
동기화 실패: 2개
소요 시간: 3.5초

[상품 확인하기 버튼]
```

**실패 이메일:**
```
⚠️ 동기화 실패

오류 내용:
네이버 API 인증 오류

💡 해결 방법
- 네이버 API 키 확인
- 계정 상태 확인
- 잠시 후 재시도

[동기화 로그 확인 버튼]
```

## 🧪 테스트 방법

### 1. 수동 테스트
```bash
# Seller 앱 실행
cd apps/seller
pnpm dev

# 브라우저에서
# 1. http://localhost:3003/login
# 2. 설정 > 자동 동기화
# 3. 알림 설정 후 "지금 실행" 버튼 클릭
# 4. 이메일 수신 확인
```

### 2. API 키 없이 테스트
- `RESEND_API_KEY`를 설정하지 않으면
- 이메일은 발송되지 않고
- 콘솔에 로그만 출력됨
- 개발 중 테스트에 유용

## 💰 비용

### Resend 무료 플랜
- **월 3,000통** 무료
- 초과 시: $1 / 1,000통
- 대부분의 소규모 사용자에게 충분

### 예상 사용량
- 사용자 100명
- 하루 1회 자동 동기화
- 실패율 5%
- 성공 알림 ON, 실패 알림 ON

**계산:**
- 성공: 100명 × 30일 × 0.95 = 2,850통
- 실패: 100명 × 30일 × 0.05 = 150통
- **합계: 3,000통/월** (무료 범위 내)

## 🔐 보안

### API 키 관리
- ✅ `.env.local`에 저장 (Git에 커밋 안 됨)
- ✅ 프로덕션은 환경 변수로 관리
- ❌ 코드에 하드코딩 금지
- ❌ 공개 저장소에 업로드 금지

### 발송 제한
- Resend는 자동으로 스팸 방지
- Rate limiting 적용
- 악용 방지 모니터링

## 🆘 문제 해결

### 이메일이 발송되지 않음
1. `RESEND_API_KEY` 확인
2. API 키 권한 확인 (Full Access)
3. 콘솔 로그 확인
4. Resend 대시보드에서 로그 확인

### 이메일이 스팸함에 들어감
1. 도메인 인증 완료 확인
2. SPF/DKIM 레코드 확인
3. 발신자 이메일 주소 확인
4. 이메일 내용 스팸 필터 통과 확인

### API 키 만료
1. Resend 대시보드에서 새 키 발급
2. 환경 변수 업데이트
3. 앱 재시작

## 📚 참고 자료

- [Resend 공식 문서](https://resend.com/docs)
- [Resend Next.js 가이드](https://resend.com/docs/send-with-nextjs)
- [Resend API 레퍼런스](https://resend.com/docs/api-reference/emails/send-email)

