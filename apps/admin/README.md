# GConnect Admin

GConnect 플랫폼 관리자 사이트입니다.

## 기능

- **대시보드**: 전체 통계 및 모니터링
- **사용자 관리**: 판매자 계정 및 상태 관리
- **상품 관리**: 전체 상품 조회 및 삭제
- **시스템 로그**: 동기화 로그 및 시스템 활동 모니터링

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
NEXTAUTH_URL=http://localhost:3004
NEXTAUTH_SECRET=admin-secret-key-change-in-production

ADMIN_EMAIL=admin@gconnect.com
ADMIN_PASSWORD=admin1234!@

DATABASE_URL="your-database-url"
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

Admin 사이트가 http://localhost:3004 에서 실행됩니다.

## 관리자 로그인

- **이메일**: admin@gconnect.com
- **비밀번호**: admin1234!@

**주의**: 프로덕션 환경에서는 반드시 관리자 계정 정보를 변경하세요!

## 보안

- 관리자 인증은 NextAuth.js를 사용합니다.
- 모든 관리자 API는 `middleware.ts`를 통해 보호됩니다.
- 세션은 JWT 전략을 사용합니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM
- **UI**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Heroicons

## 주요 페이지

- `/`: 관리자 로그인으로 리디렉션
- `/login`: 관리자 로그인
- `/dashboard`: 대시보드 홈
- `/dashboard/users`: 사용자 관리
- `/dashboard/products`: 상품 관리
- `/dashboard/logs`: 시스템 로그

## API 엔드포인트

- `GET /api/admin/stats`: 전체 통계
- `GET /api/admin/users`: 사용자 목록
- `PATCH /api/admin/users/[id]`: 사용자 상태 변경
- `GET /api/admin/products`: 상품 목록
- `DELETE /api/admin/products/[id]`: 상품 삭제
- `GET /api/admin/logs`: 시스템 로그

