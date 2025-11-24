# GConnect

네이버 스마트스토어 상품을 구글 검색에 최적화하여 노출하는 플랫폼

## 프로젝트 구조

```
gconnect/
├── apps/
│   ├── ir/          # IR 사이트 (완료 ✅)
│   ├── seller/      # 셀러 사이트 (완료 ✅)
│   ├── product/     # 상품 검색 사이트 (진행중 🚧)
│   └── admin/       # 관리자 사이트 (완료 ✅)
├── packages/
│   ├── db/          # Prisma + MSSQL Server
│   ├── ui/          # 공통 UI 컴포넌트
│   └── lib/         # 공통 유틸리티
└── SCRIPT/          # 기획 문서
```

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS + Tailwind UI
- **데이터베이스**: Microsoft SQL Server 2022
- **ORM**: Prisma
- **모노레포**: Turborepo + pnpm

## 사이트별 기능

### 🎯 IR 사이트 (포트: 3001)
- 랜딩 페이지
- 서비스 소개
- 문의 폼
- SEO 최적화

### 🛍️ Product 사이트 (포트: 3002)
- 상품 검색 및 필터링
- 상품 상세 페이지
- SEO 최적화

### 👤 Seller 사이트 (포트: 3003)
- 회원가입 / 로그인 (이메일, 네이버)
- 대시보드
- 상품 관리 (CRUD, 네이버 동기화)
- 성과 분석 (Google Analytics 연동)
- 설정 (상점, API, Google Feed, 스케줄러)
- 웹훅 시스템 (Slack, Discord)

### 🔐 Admin 사이트 (포트: 3004)
- 관리자 로그인
- 대시보드 (전체 통계)
- 사용자 관리
- 상품 관리
- 시스템 로그

## 시작하기

### 필수 사항

- Node.js 18 이상
- pnpm 8 이상
- MSSQL Server 2022

### 설치

```bash
# 의존성 설치
pnpm install

# 데이터베이스 설정
pnpm db:generate
pnpm db:push

# 각 사이트 실행
cd apps/ir && pnpm dev      # http://localhost:3001
cd apps/product && pnpm dev # http://localhost:3002
cd apps/seller && pnpm dev  # http://localhost:3003
cd apps/admin && pnpm dev   # http://localhost:3004
```

### 로그인 정보

**Admin 사이트**
- 이메일: admin@gconnect.com
- 비밀번호: admin1234!@

**Seller 사이트**
- 회원가입 후 사용

## 환경 변수

루트 디렉토리에 `.env.local` 파일을 생성하세요:

```env
# 데이터베이스 (MSSQL)
DATABASE_URL="sqlserver://211.195.9.70,14103;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=true;trustServerCertificate=true"

# 사이트 URL (개발)
NEXT_PUBLIC_IR_URL="http://localhost:3001"
NEXT_PUBLIC_PRODUCT_URL="http://localhost:3002"
NEXT_PUBLIC_SELLER_URL="http://localhost:3003"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3004"

# 사이트 URL (프로덕션)
# NEXT_PUBLIC_IR_URL="https://ir.gconnect.kr"
# NEXT_PUBLIC_PRODUCT_URL="https://www.gconnect.kr"
# NEXT_PUBLIC_SELLER_URL="https://seller.gconnect.kr"
# NEXT_PUBLIC_ADMIN_URL="https://admin.gconnect.kr"
```

## 라이센스

Proprietary

