# 웹훅 시스템 설정 가이드 🔔

동기화 완료 시 Slack, Discord 또는 커스텀 웹훅으로 알림을 받는 방법을 안내합니다.

---

## 📋 목차

1. [개요](#개요)
2. [Slack 웹훅 설정](#slack-웹훅-설정)
3. [Discord 웹훅 설정](#discord-웹훅-설정)
4. [커스텀 웹훅](#커스텀-웹훅)
5. [웹훅 관리](#웹훅-관리)
6. [문제 해결](#문제-해결)

---

## 개요

### 웹훅이란?

웹훅은 이벤트 발생 시 자동으로 HTTP POST 요청을 보내는 방식입니다.

### GConnect 웹훅 기능

- ✅ **자동 알림**: 동기화 완료/실패 시 자동 전송
- 🎨 **포맷팅**: Slack/Discord 전용 메시지 포맷
- 🔐 **보안**: 인증 토큰 암호화 저장
- 📊 **통계**: 성공/실패 횟수 추적
- 🧪 **테스트**: 웹훅 전송 테스트 기능

### 웹훅 타입

| 타입 | 설명 | 추천 용도 |
|------|------|-----------|
| Slack | Slack 채널 알림 | 팀 협업 |
| Discord | Discord 채널 알림 | 커뮤니티 |
| Custom | 커스텀 API 호출 | 자체 시스템 연동 |

---

## Slack 웹훅 설정

### 1단계: Slack Incoming Webhook 생성

1. Slack 워크스페이스에 로그인
2. https://api.slack.com/apps 접속
3. **Create New App** 클릭
4. **From scratch** 선택
5. 앱 이름: `GConnect` 입력
6. 워크스페이스 선택

### 2단계: Incoming Webhooks 활성화

1. 좌측 메뉴에서 **Incoming Webhooks** 클릭
2. **Activate Incoming Webhooks** 토글 ON
3. **Add New Webhook to Workspace** 클릭
4. 알림받을 채널 선택 (예: `#gconnect-alerts`)
5. **Allow** 클릭

### 3단계: Webhook URL 복사

```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

이 URL을 복사하세요.

### 4단계: GConnect에 등록

1. GConnect Seller 로그인
2. **웹훅** 메뉴 클릭
3. **웹훅 추가** 클릭
4. 정보 입력:
   - **이름**: `Slack 알림`
   - **타입**: `Slack` 선택
   - **Webhook URL**: 복사한 URL 붙여넣기
   - **성공 시 트리거**: ✅
   - **실패 시 트리거**: ✅
5. **추가** 클릭

### 5단계: 테스트

**테스트** 버튼을 눌러 Slack 채널에 메시지가 도착하는지 확인하세요!

---

## Discord 웹훅 설정

### 1단계: Discord Webhook 생성

1. Discord 서버에서 알림받을 채널 선택
2. 채널 설정 (⚙️) → **통합** → **웹후크**
3. **웹후크 만들기** 클릭
4. 이름: `GConnect` 입력
5. **웹후크 URL 복사** 클릭

### 2단계: Webhook URL

```
https://discord.com/api/webhooks/123456789012345678/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3단계: GConnect에 등록

1. GConnect Seller 로그인
2. **웹훅** 메뉴 클릭
3. **웹훅 추가** 클릭
4. 정보 입력:
   - **이름**: `Discord 알림`
   - **타입**: `Discord` 선택
   - **Webhook URL**: 복사한 URL 붙여넣기
   - **성공 시 트리거**: ✅
   - **실패 시 트리거**: ✅
5. **추가** 클릭

### 4단계: 테스트

**테스트** 버튼을 눌러 Discord 채널에 메시지가 도착하는지 확인하세요!

---

## 커스텀 웹훅

### 개요

커스텀 웹훅은 자체 API 엔드포인트로 알림을 받을 수 있습니다.

### 페이로드 형식

```json
{
  "event": "sync.success",
  "timestamp": "2024-11-24T05:00:00.000Z",
  "data": {
    "userId": "user-uuid",
    "shopName": "내 스마트스토어",
    "status": "SUCCESS",
    "itemsTotal": 100,
    "itemsSynced": 98,
    "itemsFailed": 2,
    "duration": 5000
  }
}
```

### 이벤트 타입

- `sync.success`: 동기화 성공
- `sync.error`: 동기화 실패

### 예시: Node.js API 엔드포인트

```javascript
// Express.js 예시
app.post('/webhook/gconnect', express.json(), (req, res) => {
  const { event, timestamp, data } = req.body;
  
  console.log(`GConnect 이벤트: ${event}`);
  console.log(`상점: ${data.shopName}`);
  console.log(`동기화: ${data.itemsSynced}/${data.itemsTotal}`);
  
  // 여기서 원하는 처리 수행
  // - 데이터베이스 저장
  // - 이메일 발송
  // - 다른 시스템 호출
  
  res.status(200).json({ ok: true });
});
```

### GConnect에 등록

1. **웹훅 추가** 클릭
2. 정보 입력:
   - **이름**: `내 API`
   - **타입**: `커스텀` 선택
   - **Webhook URL**: `https://your-api.com/webhook/gconnect`
   - **성공 시 트리거**: ✅
   - **실패 시 트리거**: ✅
3. **추가** 클릭

### 인증 (선택)

API에 인증이 필요한 경우:

```javascript
// Bearer Token 예시
app.post('/webhook/gconnect', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token !== 'your-secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... 처리
});
```

GConnect에서 인증 설정:
- **인증 타입**: `Bearer`
- **인증 값**: `your-secret-token`

---

## 웹훅 관리

### 웹훅 목록

**웹훅** 메뉴에서 모든 웹훅을 확인할 수 있습니다.

### 통계

각 웹훅별로 다음 통계를 제공합니다:
- 총 실행 횟수
- 성공 횟수
- 실패 횟수
- 마지막 실행 시간
- 마지막 상태

### 웹훅 수정

1. 웹훅 카드에서 **수정** 클릭
2. 정보 변경
3. **수정** 클릭

### 웹훅 삭제

1. 웹훅 카드에서 **🗑️** 클릭
2. 확인 메시지에서 **확인**

### 웹훅 테스트

**테스트** 버튼을 눌러 즉시 테스트 메시지를 전송할 수 있습니다.

테스트 메시지 내용:
- 상점: 현재 상점 이름
- 상태: 성공
- 총 상품: 10개
- 동기화 성공: 10개
- 소요 시간: 5초

---

## 문제 해결

### Slack 알림이 안 옴

**확인 사항**:
1. Webhook URL이 정확한지 확인
2. Slack 앱이 채널에 추가되었는지 확인
3. GConnect에서 **테스트** 버튼 클릭
4. 웹훅 통계에서 실패 여부 확인

**해결**:
- Slack 워크스페이스 관리자에게 권한 확인
- 웹훅 URL 재생성 후 다시 등록

### Discord 알림이 안 옴

**확인 사항**:
1. Webhook URL이 정확한지 확인
2. Discord 채널 권한 확인
3. 웹훅이 삭제되지 않았는지 확인

**해결**:
- Discord에서 웹훅 재생성
- GConnect에서 URL 업데이트

### 커스텀 웹훅 실패

**오류 메시지 확인**:
1. **웹훅** 메뉴에서 해당 웹훅 선택
2. 통계에서 마지막 상태 확인
3. 실패 원인 확인

**일반적인 원인**:
- API 엔드포인트가 다운됨
- 네트워크 오류
- 타임아웃 (30초 초과)
- 인증 실패
- 잘못된 응답 형식

**해결**:
1. API 서버 상태 확인
2. API 로그 확인
3. URL이 HTTPS인지 확인
4. 인증 토큰 재확인

### 웹훅이 너무 많이 실행됨

**원인**:
- 자동 동기화가 너무 자주 실행됨

**해결**:
1. **설정** → **자동 동기화**
2. 실행 주기 조정 (예: 24시간)
3. 또는 **성공 시 트리거** 비활성화

---

## 베스트 프랙티스

### 1. 채널 분리

Slack/Discord에서 알림 전용 채널 생성:
- `#gconnect-success`: 성공 알림
- `#gconnect-errors`: 오류 알림

### 2. 알림 필터링

필요한 알림만 받기:
- 성공 알림은 OFF (너무 많을 수 있음)
- 실패 알림만 ON (즉시 대응 필요)

### 3. 여러 웹훅 사용

- Slack: 팀 알림
- Discord: 개인 알림
- Custom: 자동화 시스템

### 4. 테스트 주기

- 매월 1회 **테스트** 버튼으로 작동 확인
- 웹훅 URL 변경 시 즉시 테스트

---

## 예시 시나리오

### 시나리오 1: 팀 협업

```
목적: 동기화 실패 시 팀에게 즉시 알림

설정:
- Slack 웹훅 추가
- 채널: #team-alerts
- 성공 시: OFF
- 실패 시: ON

결과:
→ 동기화 실패 시 팀 전체에 Slack 알림
→ 빠른 대응 가능
```

### 시나리오 2: 자동화

```
목적: 동기화 완료 시 재고 관리 시스템 업데이트

설정:
- 커스텀 웹훅 추가
- URL: https://inventory.company.com/api/gconnect
- 성공 시: ON
- 실패 시: OFF

결과:
→ 동기화 완료 시 재고 시스템 자동 업데이트
→ 수동 작업 제거
```

### 시나리오 3: 다중 알림

```
목적: 여러 채널에 동시 알림

설정:
1. Slack 웹훅 (팀)
2. Discord 웹훅 (개인)
3. 이메일 (설정 → 알림)

결과:
→ 모든 채널에서 동시에 알림 수신
→ 놓칠 확률 최소화
```

---

## 요약

✅ **완료 체크리스트**

- [ ] 웹훅 타입 선택 (Slack/Discord/Custom)
- [ ] Webhook URL 생성
- [ ] GConnect에 웹훅 등록
- [ ] 테스트 메시지 전송
- [ ] 자동 동기화 실행 후 알림 확인
- [ ] 통계 모니터링

---

**참고 자료**:
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Discord Webhooks](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

축하합니다! 이제 동기화 알림을 자동으로 받을 수 있습니다! 🎉

