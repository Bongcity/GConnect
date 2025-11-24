# GConnect IR 사이트

GConnect 서비스 소개 및 도입 상담을 위한 IR(Investor Relations) 사이트입니다.

## 🚀 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS + Tailwind UI Premium
- **애니메이션**: Framer Motion
- **UI 컴포넌트**: Headless UI
- **데이터베이스**: MSSQL (Prisma ORM)
- **폰트**: Pretendard

## 📁 프로젝트 구조

```
apps/ir/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   └── inquiry/          # 문의 접수 API
│   ├── how-it-works/         # 동작 방식 페이지
│   ├── security/             # 보안 정책 페이지
│   ├── layout.tsx            # 루트 레이아웃
│   ├── page.tsx              # 메인 페이지
│   ├── globals.css           # 글로벌 스타일
│   ├── sitemap.ts            # Sitemap 생성
│   └── robots.ts             # Robots.txt 생성
├── components/               # React 컴포넌트
│   ├── layout/               # 레이아웃 컴포넌트
│   ├── sections/             # 페이지 섹션
│   ├── InquiryWidget.tsx     # 플로팅 문의 위젯
│   └── OrganizationSchema.tsx # JSON-LD 스키마
├── public/                   # 정적 파일
└── package.json
```

## 🎨 주요 기능

### 메인 페이지 섹션
1. **히어로 섹션**: 서비스 소개 + 플로우 다이어그램
2. **미션/가치**: Automated, Safe, Fair
3. **동작 방식**: 3단계 프로세스 설명
4. **대상 고객**: 스마트스토어 운영자, 마케팅 대행사
5. **요금제**: Starter, Pro, Enterprise
6. **보안 프리뷰**: 데이터 수집 및 보안 정책
7. **FAQ**: 자주 묻는 질문 (아코디언)
8. **최종 CTA**: 무료 체험 안내

### 추가 페이지
- `/how-it-works`: 상세 동작 방식 (4단계)
- `/security`: 데이터 & 보안 정책 상세

### 문의 시스템
- 우측 하단 플로팅 문의 버튼
- 모달 폼 (7개 필드)
- `/api/inquiry` API로 MSSQL에 저장

## 🛠️ 개발 환경 설정

### 환경 변수

루트 디렉토리에 `.env.local` 파일을 생성하세요:

\`\`\`env
# 데이터베이스
DATABASE_URL="sqlserver://211.195.9.70,14103;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=true;trustServerCertificate=true"

# 사이트 URL
NEXT_PUBLIC_IR_URL="http://localhost:3001"
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3002"
NEXT_PUBLIC_SELLER_URL="http://localhost:3003"
\`\`\`

### 설치 및 실행

\`\`\`bash
# 루트에서 의존성 설치
pnpm install

# Prisma Client 생성
pnpm db:generate

# 데이터베이스 스키마 동기화
pnpm db:push

# IR 사이트 개발 서버 실행 (포트 3001)
cd apps/ir
pnpm dev
\`\`\`

브라우저에서 [http://localhost:3001](http://localhost:3001) 을 엽니다.

## 🎨 디자인 시스템

### 컬러 팔레트
- **배경**: `#050816` → `#05051A` (딥 네이비/퍼플 그라디언트)
- **포인트 컬러**: `#22F089` (네온 그린)
- **서브 컬러**: `#00d4ff` (시안)

### 글라스모피즘
- `.glass-card`: 반투명 배경 + 블러 효과
- `.glass-card-hover`: hover 시 밝아지는 효과

### 버튼 스타일
- `.btn-neon`: 네온 그린 메인 CTA
- `.btn-secondary`: 반투명 서브 버튼

## 📱 반응형 디자인

- **모바일**: < 640px
- **태블릿**: 640px ~ 1024px
- **데스크톱**: ≥ 1024px

모든 섹션과 컴포넌트는 반응형으로 설계되었습니다.

## 🔍 SEO 최적화

- ✅ Metadata (title, description, og)
- ✅ Organization JSON-LD 스키마
- ✅ Sitemap.xml 자동 생성
- ✅ Robots.txt
- ✅ 시맨틱 HTML
- ✅ 이미지 alt 태그

## 📊 Analytics & Monitoring

추후 구현 예정:
- Google Analytics
- Google Search Console
- 문의 대시보드 (Admin 사이트에서)

## 🚢 배포

### Vercel (권장)
\`\`\`bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
\`\`\`

### Docker
\`\`\`bash
# 이미지 빌드
docker build -t gconnect-ir .

# 컨테이너 실행
docker run -p 3001:3001 gconnect-ir
\`\`\`

## 📝 TODO

- [ ] 이미지 최적화 (로고, 아이콘 등)
- [ ] 성능 최적화 (Lighthouse 100점)
- [ ] 다국어 지원 (i18n)
- [ ] Google Analytics 연동
- [ ] 문의 알림 (이메일/Slack)

## 📄 라이센스

Proprietary - GConnect

