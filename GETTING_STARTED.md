# 🚀 GConnect 프로젝트 시작 가이드

## 📋 사전 요구사항

시작하기 전에 다음 항목들이 설치되어 있는지 확인하세요:

- **Node.js**: v18 이상
- **pnpm**: v8 이상
- **MSSQL Server**: 2022 (이미 설정됨)

```bash
# Node.js 버전 확인
node -v

# pnpm 설치 (없는 경우)
npm install -g pnpm

# pnpm 버전 확인
pnpm -v
```

## 📁 프로젝트 구조

```
GConnect/
├── apps/
│   ├── ir/              # IR 사이트 (완료 ✅)
│   ├── seller/          # 셀러 사이트 (완료 ✅)
│   ├── product/         # 상품 사이트 (진행중 🚧)
│   └── admin/           # 관리자 사이트 (완료 ✅)
├── packages/
│   ├── db/              # Prisma + MSSQL
│   ├── ui/              # 공통 UI 컴포넌트
│   └── lib/             # 공통 유틸리티
└── SCRIPT/              # 기획 문서
```

## 🛠️ 설치 및 실행

### 1단계: 의존성 설치

루트 디렉토리에서 실행:

```bash
pnpm install
```

### 2단계: 환경 변수 설정

루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# 데이터베이스
DATABASE_URL="sqlserver://211.195.9.70,14103;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=true;trustServerCertificate=true"

# 사이트 URL (개발)
NEXT_PUBLIC_IR_URL="http://localhost:3001"
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
NEXT_PUBLIC_PRODUCT_URL="http://localhost:3002"
NEXT_PUBLIC_SELLER_URL="http://localhost:3003"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3004"
```

### 3단계: 데이터베이스 설정

```bash
# Prisma Client 생성
pnpm db:generate

# 데이터베이스 스키마 동기화
pnpm db:push
```

### 4단계: 사이트 실행

각 사이트를 독립적으로 실행할 수 있습니다:

```bash
# IR 사이트 (포트 3001)
cd apps/ir
pnpm dev

# Product 사이트 (포트 3002)
cd apps/product
pnpm dev

# Seller 사이트 (포트 3003)
cd apps/seller
pnpm dev

# Admin 사이트 (포트 3004)
cd apps/admin
pnpm dev
```

**접속 URL:**
- IR: [http://localhost:3001](http://localhost:3001)
- Product: [http://localhost:3002](http://localhost:3002)
- Seller: [http://localhost:3003](http://localhost:3003)
- Admin: [http://localhost:3004](http://localhost:3004)

## ✅ IR 사이트 구현 완료 항목

### 🎨 UI/UX
- ✅ 딥 네이비/퍼플 그라디언트 배경
- ✅ 글라스모피즘 디자인 시스템
- ✅ 네온 그린 포인트 컬러
- ✅ Pretendard 폰트 적용
- ✅ Framer Motion 애니메이션
- ✅ 완전 반응형 디자인

### 📄 페이지
- ✅ 메인 페이지 (8개 섹션)
  - 히어로 (다이어그램 포함)
  - 미션/가치 (3개 카드)
  - 동작 방식 (3단계)
  - 대상 고객 (2개 카드)
  - 요금제 (3개 플랜)
  - 보안 프리뷰
  - FAQ (아코디언)
  - 최종 CTA
- ✅ `/how-it-works` - 동작 방식 상세
- ✅ `/security` - 데이터 & 보안 정책

### 🧩 컴포넌트
- ✅ Header (스크롤 감지 + 모바일 메뉴)
- ✅ Footer (링크 + 정보)
- ✅ 플로팅 문의 위젯 (우측 하단)
- ✅ 문의 모달 폼 (7개 필드)

### 🔌 백엔드
- ✅ `/api/inquiry` - 문의 접수 API
- ✅ Prisma + MSSQL 연결
- ✅ IRInquiry 테이블 스키마
- ✅ Zod 유효성 검사

### 🔍 SEO
- ✅ Metadata (모든 페이지)
- ✅ Organization JSON-LD
- ✅ Sitemap.xml
- ✅ Robots.txt

## 🔐 로그인 정보

### Admin 사이트
- **URL**: http://localhost:3004
- **이메일**: admin@gconnect.com
- **비밀번호**: admin1234!@

### Seller 사이트
- **URL**: http://localhost:3003
- **계정**: 회원가입 후 사용

## 🎯 구현 완료 사이트

### ✅ IR 사이트 (완료)
- 랜딩 페이지, 문의 폼, SEO 최적화

### ✅ Seller 사이트 (완료)
- 로그인/회원가입 (이메일, 네이버)
- 대시보드 (구독 플랜 정보 포함)
- 상품 관리 (CRUD, 동기화, 플랜 제한 표시)
- 성과 분석
- 설정 (상점, API, 자동 동기화, 프로필, 비밀번호)
- 웹훅 시스템

### ✅ Admin 사이트 (완료)
- 관리자 로그인
- 대시보드 (전체 통계)
- 사용자 관리 (상태 변경)
- 상품 관리 (조회, 삭제)
- 구독 관리 (플랜, 사용량 모니터링)
- Google 피드 설정 (전체 사용자 피드 관리)
- 시스템 로그

### 🚧 Product 사이트 (진행중)
- 홈페이지, 상품 목록, 상품 상세, 검색

## 🐛 문제 해결

### 데이터베이스 연결 오류
```bash
# Prisma Client 재생성
pnpm db:generate

# 연결 테스트
pnpm db:studio
```

### 포트 충돌
IR 사이트는 기본적으로 포트 3001을 사용합니다. 다른 포트를 사용하려면:
```bash
PORT=3005 pnpm dev
```

### 빌드 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
pnpm install
```

## 📚 참고 문서

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [Framer Motion 문서](https://www.framer.com/motion/)

## 💡 유용한 명령어

```bash
# 전체 프로젝트 빌드
pnpm build

# 타입 체크
cd apps/ir
pnpm type-check

# 린트
pnpm lint

# Prisma Studio (DB 관리 UI)
pnpm db:studio

# 프로덕션 모드 실행
cd apps/ir
pnpm build
pnpm start
```

## 🎨 Tailwind UI 계정

계정 정보:
- 이메일: thumbup.certi@gmail.com
- 비밀번호: kmsoft1071@

[Tailwind UI](https://tailwindui.com) 에서 프리미엄 컴포넌트를 확인할 수 있습니다.

## 📞 지원

문제가 발생하거나 질문이 있으시면:
- 프로젝트 이슈 생성
- 또는 개발팀에 문의

## 📝 환경 변수 설정 (Admin)

Admin 사이트 실행 전에 `apps/admin/.env.local` 파일을 생성하세요:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3004
NEXTAUTH_SECRET=admin-secret-key-change-in-production

# Admin Credentials
ADMIN_EMAIL=admin@gconnect.com
ADMIN_PASSWORD=admin1234!@

# Database
DATABASE_URL="sqlserver://211.195.9.70:14103;database=GCONNECT;user=gconnect_admini;password={@zi9.co.kr#5096};encrypt=true;trustServerCertificate=true"
```

---

**축하합니다! 🎉 GConnect IR, Seller, Admin 사이트 구현이 완료되었습니다.**

