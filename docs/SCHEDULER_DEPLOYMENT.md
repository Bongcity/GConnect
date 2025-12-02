# GConnect 자동 동기화 스케줄러 배포 가이드

## 개요

이 문서는 GConnect 자동 동기화 스케줄러의 배포 및 운영 방법을 설명합니다.

## 주요 변경 사항

### 1. 샘플 데이터 제거
- ❌ 네이버 API 실패 시 샘플 데이터로 폴백하던 기능 제거
- ✅ 네이버 API 키가 없으면 명확한 에러 메시지 반환
- ✅ 실제 상품만 데이터베이스에 저장

### 2. 재시도 로직 추가
- 최대 3회 재시도
- 5분 간격으로 exponential backoff 적용
- 재시도 횟수와 결과를 `SyncLog`에 기록
- 인증 에러는 재시도하지 않고 즉시 실패 처리

### 3. 자동 동기화 시스템
- 독립 실행 스케줄러 (node-cron 기반)
- 매 4시간마다 자동 동기화 (기본값, 사용자 설정 가능)
- 동기화 실패 시 관리자 알림 자동 생성
- PM2로 프로세스 관리

## 배포 단계

### 1. 의존성 설치

```bash
# 루트 디렉토리에서 실행
pnpm install
```

이미 설치된 패키지:
- `node-cron`: 크론 스케줄러
- `@types/node-cron`: TypeScript 타입 정의
- `tsx`: TypeScript 실행 환경

### 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
# 스케줄러 설정
SCHEDULER_CHECK_INTERVAL=60000  # 1분 (밀리초)
SCHEDULER_MAX_CONCURRENT=1      # 동시 실행 작업 수
SCHEDULER_ENABLED=true          # 스케줄러 활성화 여부
```

### 3. 데이터베이스 확인

`SyncSchedule` 테이블이 이미 존재하므로 별도의 마이그레이션은 필요하지 않습니다.

확인 방법:
```bash
pnpm db:studio
```

### 4. 로컬 테스트

#### 개발 모드로 스케줄러 실행:
```bash
pnpm scheduler:dev
```

#### 수동 동기화 테스트:
1. 셀러 앱 실행: `cd apps/seller && pnpm dev`
2. 브라우저에서 `http://localhost:3003/dashboard/sync-settings` 접속
3. "지금 동기화" 버튼 클릭

### 5. 프로덕션 배포 (PM2 사용)

#### PM2 설치 (전역):
```bash
npm install -g pm2
```

#### 모든 앱 시작 (스케줄러 포함):
```bash
pm2 start ecosystem.config.js
```

#### 특정 앱만 시작:
```bash
# 스케줄러만 시작
pm2 start ecosystem.config.js --only gconnect-scheduler

# IR 사이트만 시작
pm2 start ecosystem.config.js --only gconnect-ir
```

#### PM2 상태 확인:
```bash
pm2 status
```

#### 로그 확인:
```bash
# 모든 앱 로그
pm2 logs

# 스케줄러 로그만
pm2 logs gconnect-scheduler

# 실시간 로그 스트리밍
pm2 logs --lines 100
```

#### 재시작:
```bash
# 모든 앱 재시작
pm2 restart ecosystem.config.js

# 스케줄러만 재시작
pm2 restart gconnect-scheduler
```

#### 중지:
```bash
# 모든 앱 중지
pm2 stop ecosystem.config.js

# 스케줄러만 중지
pm2 stop gconnect-scheduler
```

#### 삭제:
```bash
# PM2에서 모든 앱 제거
pm2 delete ecosystem.config.js

# 스케줄러만 제거
pm2 delete gconnect-scheduler
```

#### PM2 자동 시작 설정 (서버 재부팅 시):
```bash
# 현재 PM2 프로세스 목록을 시작 스크립트로 저장
pm2 save

# 시스템 부팅 시 PM2 자동 시작 설정
pm2 startup
```

### 6. Windows 서버 배포 (현재 환경)

Windows에서는 PM2 대신 PowerShell 창을 여러 개 띄워서 각 앱을 실행하는 방식을 사용 중입니다.

#### 기존 프로세스 종료:
```powershell
taskkill /F /IM node.exe
```

#### Git 업데이트:
```powershell
git stash
git pull
git stash pop
```

#### 의존성 및 Prisma 재생성:
```powershell
pnpm install
cd packages/db
pnpm prisma generate --schema=prisma/schema.prisma
pnpm prisma generate --schema=prisma/schema-ddro.prisma
cd ../..
```

#### 각 앱 실행 (별도 PowerShell 창):
```powershell
# 창 1: IR 앱
cd D:\gconnect\apps\ir
pnpm dev

# 창 2: Product 앱
cd D:\gconnect\apps\product
pnpm dev

# 창 3: Seller 앱
cd D:\gconnect\apps\seller
pnpm dev

# 창 4: Admin 앱
cd D:\gconnect\apps\admin
pnpm dev

# 창 5: 스케줄러 (새로 추가!)
cd D:\gconnect
pnpm scheduler
```

또는 한 번에 실행:
```powershell
# IR 앱
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\gconnect\apps\ir; pnpm dev"

# Product 앱
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\gconnect\apps\product; pnpm dev"

# Seller 앱
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\gconnect\apps\seller; pnpm dev"

# Admin 앱
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\gconnect\apps\admin; pnpm dev"

# 스케줄러
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\gconnect; pnpm scheduler"
```

## 사용자 설정

### 셀러가 자동 동기화 설정하는 방법

1. **네이버 API 키 등록** (필수):
   - 셀러 대시보드 → 설정 → 네이버 API
   - Client ID와 Client Secret 입력

2. **자동 동기화 활성화**:
   - 셀러 대시보드 → 자동 동기화 설정
   - "자동 동기화" 토글을 ON으로 설정

3. **동기화 주기 선택**:
   - 매 4시간마다 (권장)
   - 매 6시간마다
   - 매 12시간마다
   - 매일 새벽 2시

4. **알림 설정**:
   - 동기화 실패 시 알림 받기 (권장)
   - 동기화 성공 시 알림 받기

## 모니터링

### 1. 스케줄러 로그 확인

```bash
# PM2 로그
pm2 logs gconnect-scheduler

# 또는 직접 실행 시 콘솔 출력 확인
```

로그 예시:
```
[Scheduler] GConnect 자동 동기화 스케줄러 시작
[Scheduler] 확인 간격: 60초
[Scheduler] 최대 동시 작업: 1개
[Scheduler] 스케줄러가 실행 중입니다...
[Scheduler] 2개의 동기화 작업 발견
[Scheduler] 사용자 user-123 동기화 시작
[Scheduler] 네이버 API 호출 시도 1/3
[Scheduler] 성공: 150개 상품 가져옴
[Scheduler] 사용자 user-123 동기화 완료: 150개 성공, 0개 실패
```

### 2. 관리자 대시보드에서 확인

- Admin 앱 → 알림
- 동기화 실패 시 자동으로 알림이 생성됩니다.

### 3. 동기화 로그 확인

- Seller 앱 → 동기화 로그
- 각 동기화 작업의 상세 내역 확인 가능

## 문제 해결

### 스케줄러가 시작되지 않는 경우

1. 환경 변수 확인:
   ```bash
   echo $SCHEDULER_ENABLED
   ```

2. 데이터베이스 연결 확인:
   ```bash
   pnpm db:studio
   ```

3. 로그 확인:
   ```bash
   pm2 logs gconnect-scheduler --lines 50
   ```

### 동기화가 실행되지 않는 경우

1. `SyncSchedule` 테이블 확인:
   - `isEnabled`가 `true`인지 확인
   - `nextRun`이 과거 시간인지 확인

2. 네이버 API 키 확인:
   - `User` 테이블에서 `naverApiEnabled`가 `true`인지 확인
   - `naverClientId`와 `naverClientSecret`이 저장되어 있는지 확인

3. 수동 동기화 테스트:
   ```bash
   curl -X POST http://localhost:3003/api/products/sync \
     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
   ```

### 동기화가 실패하는 경우

1. 에러 로그 확인:
   - `SyncLog` 테이블의 `errorLog` 필드 확인
   - 관리자 알림 확인

2. 네이버 API 응답 확인:
   - 인증 에러: API 키가 잘못되었거나 만료됨
   - 네트워크 에러: 네이버 API 서버 연결 실패
   - 데이터 에러: 상품 데이터 형식 오류

3. 재시도 로직 확인:
   - 로그에서 재시도 횟수 확인
   - 인증 에러는 재시도하지 않음

## 성능 최적화

### 동시 실행 작업 수 조정

`.env.local`:
```env
SCHEDULER_MAX_CONCURRENT=3  # 동시에 3명의 사용자 동기화
```

주의: 너무 많이 설정하면 네이버 API 레이트 리밋에 걸릴 수 있습니다.

### 확인 간격 조정

```env
SCHEDULER_CHECK_INTERVAL=120000  # 2분으로 변경
```

주의: 너무 짧게 설정하면 DB 부하가 증가합니다.

## 보안 고려사항

1. **환경 변수 보호**:
   - `.env.local` 파일은 절대 Git에 커밋하지 마세요.
   - 프로덕션 서버에서는 환경 변수를 안전하게 관리하세요.

2. **네이버 API 키 암호화**:
   - `ENCRYPTION_KEY`를 안전하게 보관하세요.
   - 키가 노출되면 모든 셀러의 API 키를 재등록해야 합니다.

3. **관리자 알림**:
   - 민감한 정보(API 키, 비밀번호 등)를 알림 메시지에 포함하지 마세요.

## 추가 리소스

- [node-cron 문서](https://github.com/node-cron/node-cron)
- [PM2 문서](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [네이버 커머스 API 문서](https://developer.pay.naver.com/docs/v2/api)

## 지원

문제가 발생하면 다음을 확인하세요:
1. 로그 파일
2. `SyncLog` 테이블
3. 관리자 알림
4. 이 문서의 "문제 해결" 섹션

그래도 해결되지 않으면 개발팀에 문의하세요.

