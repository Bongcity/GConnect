# 🚀 GConnect 개발 가이드

> 빠른 참고용 실무 가이드 | 상세 내용은 `docs/project-history-20241124.md` 참고

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [빠른 시작](#-빠른-시작)
3. [프로젝트 구조](#-프로젝트-구조)
4. [데이터베이스](#-데이터베이스)
5. [API 엔드포인트](#-api-엔드포인트)
6. [디자인 시스템](#-디자인-시스템)
7. [주요 기능 로직](#-주요-기능-로직)
8. [배포 정보](#-배포-정보)

---

## 🎯 프로젝트 개요

**GConnect** = 네이버 스마트스토어 상품을 구글에 자동 노출하는 SEO 플랫폼

### 4개 사이트 구조

| 사이트 | 도메인 | 포트 | 용도 |
|--------|--------|------|------|
| **IR** | ir.gconnect.kr | 3001 | 서비스 소개 및 문의 접수 |
| **Product** | www.gconnect.kr | 3002 | 상품 검색 허브 (소비자용) |
| **Seller** | seller.gconnect.kr | 3004 | 상점 관리 (판매자용) |
| **Admin** | admin.gconnect.kr | 3003 | 플랫폼 운영 콘솔 |

### 비즈니스 모델

- **수익**: 월 구독제 (Starter 30만 / Pro 80만 / Enterprise 협의)
- **핵심 흐름**: 네이버 상품 → GConnect → 구글 검색 노출
- **연동 방식**: 크롤링 or 네이버 Commerce API

---

## ⚡ 빠른 시작

```bash
# 1. 의존성 설치
pnpm install

# 2. 데이터베이스 설정
pnpm db:generate
pnpm db:push

# 3. 환경 변수 설정 (.env.local)
# 각 앱 폴더에 생성 (아래 템플릿 참고)

# 4. 개발 서버 실행
pnpm dev                      # 전체 실행
pnpm --filter @gconnect/ir dev      # IR만
pnpm --filter @gconnect/seller dev  # Seller만
```

### 환경 변수 템플릿

```env
# Database
DATABASE_URL="sqlserver://211.195.9.70,14103;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=true;trustServerCertificate=true"

# NextAuth (Seller/Admin 전용)
NEXTAUTH_URL="http://localhost:3004"
NEXTAUTH_SECRET="your-secret-key-here"

# App URLs
NEXT_PUBLIC_IR_URL="http://localhost:3001"
NEXT_PUBLIC_WEB_URL="http://localhost:3002"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3003"
NEXT_PUBLIC_SELLER_URL="http://localhost:3004"
```

---

## 📁 프로젝트 구조

```
D:\GConnect\
├── apps/
│   ├── ir/           # IR 사이트
│   ├── product/      # 상품 검색 사이트
│   ├── seller/       # 셀러 사이트 (NextAuth)
│   └── admin/        # 관리자 사이트 (NextAuth)
│
├── packages/
│   ├── db/           # Prisma + MSSQL
│   ├── lib/          # 공통 유틸/타입/밸리데이션
│   └── ui/           # 공통 UI 컴포넌트
│
├── docs/             # 문서 및 가이드
└── SCRIPT/           # 기획 문서
```

---

## 🗄️ 데이터베이스

### 연결 정보

- **DBMS**: Microsoft SQL Server 2022
- **서버**: `211.195.9.70,14103`
- **DB명**: `GCONNECT`
- **유저**: `gconnect_admini`
- **ORM**: Prisma

### 주요 테이블

#### IR & 문의
```typescript
IRInquiry {
  id, storeName, email, phone, 
  planIntent, inquiryType, message,
  isHandled, createdAt
}
```

#### 상점 & 요금제
```typescript
Shop {
  id, name, naverShopName, naverUrl, naverShopId,
  status, currentPlanId
}

Plan {
  id, name, type, maxProducts, monthlyPrice, isActive
}

ShopPlanSubscription {
  shopId, planId, startDate, endDate, status
}
```

#### 상품
```typescript
Product {
  id, shopId, naverProductId, name, price,
  imageUrl, categoryPath, 
  isActive, isPaidMerchant,
  lastSyncedAt, lastSyncSource
}

ProductStat {
  productId, date, views, clicks, ctr
}
```

#### 네이버 연동
```typescript
ShopIntegration {
  shopId, naverApiKey, naverClientSecret,
  naverShopId, isApiEnabled, lastSyncAt
}

CrawlJob {
  shopId, type, status, startedAt, completedAt,
  productsFound, productsCreated
}
```

#### 사용자 & 로그
```typescript
SellerUser {
  id, email, password, name, role, shopId
}

AdminUser {
  id, email, password, name, role, permissions
}

ClickLog, SearchLog, Alert, SupportTicket, ShopMessage
```

### Prisma 명령어

```bash
pnpm db:generate    # Client 생성
pnpm db:push        # 스키마 푸시 (개발용)
pnpm db:studio      # DB GUI 열기
pnpm db:migrate     # 마이그레이션 생성
```

---

## 🔌 API 엔드포인트

### IR 사이트 (`/apps/ir/app/api`)

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/inquiry` | POST | 문의 접수 |

### Seller 사이트 (`/apps/seller/app/api`)

#### 인증
- `POST /api/auth/[...nextauth]` - NextAuth 엔드포인트
- `POST /api/register` - 회원가입

#### 상품
- `GET /api/products` - 내 상품 목록
- `GET /api/products/[id]` - 상품 상세
- `POST /api/products/sync` - 수동 동기화

#### 네이버 연동
- `GET /api/user/naver-api` - API 키 조회
- `POST /api/user/naver-api` - API 키 등록
- `POST /api/user/naver-api/test` - 연결 테스트

#### 설정
- `GET /api/user/profile` - 프로필 조회
- `PUT /api/user/profile` - 프로필 수정
- `POST /api/user/change-password` - 비밀번호 변경
- `GET /api/user/shop-settings` - 상점 설정 조회
- `PUT /api/user/shop-settings` - 상점 설정 수정

#### 통계
- `GET /api/analytics` - 통계 데이터

#### 웹훅
- `GET /api/webhooks` - 웹훅 목록
- `POST /api/webhooks` - 웹훅 생성
- `PUT /api/webhooks/[id]` - 웹훅 수정
- `DELETE /api/webhooks/[id]` - 웹훅 삭제
- `POST /api/webhooks/[id]/test` - 웹훅 테스트

#### 스케줄러
- `GET /api/scheduler` - 스케줄 설정 조회
- `PUT /api/scheduler` - 스케줄 설정 수정
- `POST /api/scheduler/run` - 즉시 실행

### Admin 사이트 (`/apps/admin/app/api`)

- `GET /api/admin/users` - 사용자 관리
- `GET /api/admin/products` - 전체 상품 관리
- `GET /api/admin/stats` - 플랫폼 통계
- `GET /api/admin/logs` - 시스템 로그

---

## 🎨 디자인 시스템

### 브랜드 컬러

```css
brand-navy: #050816      /* 다크 배경 */
brand-neon: #22F089      /* 네온 그린 (Primary) */
brand-cyan: #00d4ff      /* 사이언 (Accent) */
```

### Tailwind 유틸리티 클래스

```css
/* 글라스모피즘 */
.glass-card          /* 기본 글라스 카드 */
.glass-card-hover    /* 호버 효과 포함 */

/* 그라디언트 텍스트 */
.gradient-text       /* neon → cyan 그라디언트 */

/* 버튼 */
.btn-neon           /* 네온 그린 버튼 */
.btn-secondary      /* 투명 보더 버튼 */

/* 레이아웃 */
.container-custom   /* 최대 너비 컨테이너 */
.section-padding    /* 섹션 패딩 */
```

### 폰트

- **Primary**: Pretendard (CDN)
- **Fallback**: Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic

### Tailwind UI 계정

- **이메일**: thumbup.certi@gmail.com
- **비밀번호**: kmsoft1071@

---

## 🧠 주요 기능 로직

### 상품 인입 파이프라인

```
네이버 스마트스토어
        ↓
 [크롤링 or API]
        ↓
   CrawlJob (PENDING → RUNNING → SUCCESS)
        ↓
  Product 테이블 저장
        ↓
   SEO 구조화 (slug, meta)
        ↓
  구글 인덱싱 (sitemap.xml)
```

### 네이버 연동 우선순위

1. **API 키 연동** (우선) - 안정적, 실시간
2. **크롤링** (대체) - API 없을 때 fallback

### 검색 정렬 로직 (상품 사이트)

```typescript
// 우선순위 순서
1. isPaidMerchant (입점 상점 우선)
2. 검색어 관련도 (name, categoryPath)
3. ProductStat (클릭, 조회수)
4. updatedAt (최신성)
```

### 통계 수집 흐름

```
사용자 행동 → 로그 테이블
  ↓
SearchLog (검색어, 타임스탬프)
ClickLog (상품 ID, 전환 여부)
  ↓
배치 스크립트 (매일 자정)
  ↓
ProductStat 집계
  ↓
Seller 대시보드 / 리포트
```

### 셀러 사이트 권한

- **읽기 전용**: 상품 정보 (네이버가 원본)
- **수정 가능**: GConnect 노출 여부 (isActive)
- **위험 작업**: 확인 모달 필수 (API 키 삭제, 연동 해제)

---

## 🚢 배포 정보

### 포트 할당

| 앱 | 개발 포트 | 프로덕션 URL |
|----|---------|--------------|
| IR | 3001 | ir.gconnect.kr |
| Product | 3002 | www.gconnect.kr |
| Admin | 3003 | admin.gconnect.kr |
| Seller | 3004 | seller.gconnect.kr |

### 빌드 명령어

```bash
pnpm build                         # 전체 빌드
pnpm --filter @gconnect/ir build  # 개별 빌드
```

### 환경별 설정

- `.env.local` - 로컬 개발
- `.env.development` - 개발 서버
- `.env.production` - 프로덕션

---

## 📚 추가 문서

- **전체 대화 기록**: `docs/project-history-20241124.md`
- **Webhook 가이드**: `docs/WEBHOOK_SETUP_GUIDE.md`
- **알림 설정**: `docs/NOTIFICATION_SETUP_GUIDE.md`
- **구글 머천트**: `docs/GOOGLE_MERCHANT_CENTER_GUIDE.md`
- **기획 문서**: `SCRIPT/` 폴더

---

## 🔧 자주 쓰는 명령어

```bash
# 데이터베이스
pnpm db:generate && pnpm db:push

# 개발 서버
pnpm dev
pnpm --filter @gconnect/seller dev

# 타입 체크
pnpm type-check

# 린트
pnpm lint

# 전체 클린
pnpm clean
```

---

## 🐛 문제 해결

### DB 연결 오류
- MSSQL 서버 접근 가능한지 확인
- `encrypt=true` + `trustServerCertificate=true` 필수

### NextAuth 오류
- `NEXTAUTH_SECRET` 환경 변수 확인
- `NEXTAUTH_URL` 정확한지 확인

### 빌드 오류
- `pnpm db:generate` 먼저 실행
- `node_modules` 삭제 후 `pnpm install` 재시도

---

## 📞 도움이 필요하면

1. 상세 대화 기록: `docs/project-history-20241124.md`
2. 기획 문서: `SCRIPT/GConnect.txt`, `SELLER.txt`, `ADMIN.txt`
3. 프로젝트 히스토리: 이전 Cursor 대화 참고

---

**Last Updated**: 2024-11-24  
**Version**: 1.0.0

