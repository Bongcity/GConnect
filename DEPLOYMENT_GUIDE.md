# 🚀 서버 배포 가이드

## 📋 배포 순서

### 1. 서버 접속
```bash
ssh user@your-server-ip
```

### 2. 프로젝트 디렉토리로 이동
```bash
cd /path/to/GConnect
```

### 3. Git Pull
```bash
git pull origin main
```

### 4. 의존성 업데이트 (필요시)
```bash
pnpm install
```

### 5. 환경변수 확인
프로젝트 루트에 `.env` 파일이 있는지 확인하고, 필요한 환경변수가 모두 설정되어 있는지 확인합니다.

**필수 환경변수:**
```env
# GConnect DB (MSSQL)
DATABASE_URL="sqlserver://서버주소:포트;database=GConnect;user=사용자;password=비밀번호;encrypt=true;trustServerCertificate=true"

# DDRo DB (MSSQL) - GLOBAL 상품 데이터
DDRO_DATABASE_URL="sqlserver://59.23.231.197:14103;database=DDRo;user=1stplatfor_sql;password=비밀번호;encrypt=true;trustServerCertificate=true"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="랜덤한-시크릿-키"

# 네이버 로그인 (선택)
NAVER_CLIENT_ID="네이버_클라이언트_ID"
NAVER_CLIENT_SECRET="네이버_클라이언트_시크릿"
```

### 6. Prisma 클라이언트 생성
```bash
cd packages/db
pnpm prisma generate
cd ../..
```

### 7. 빌드
```bash
pnpm build
```

**주의:** Turbo Repo 구조이므로 모든 앱이 함께 빌드됩니다.
- `apps/product` - 상품 페이지 (포트: 3002)
- `apps/seller` - 셀러 대시보드 (포트: 3001)
- `apps/admin` - 관리자 페이지 (포트: 3003)
- `apps/ir` - IR 페이지 (포트: 3000)

### 8. 기존 프로세스 중지 (PM2 사용 예시)
```bash
pm2 stop gconnect-product
pm2 stop gconnect-seller
pm2 stop gconnect-admin
pm2 stop gconnect-ir
```

### 9. 새 프로세스 시작
```bash
# Product App (포트 3002)
pm2 start npm --name "gconnect-product" -- run start:product

# Seller App (포트 3001)
pm2 start npm --name "gconnect-seller" -- run start:seller

# Admin App (포트 3003)
pm2 start npm --name "gconnect-admin" -- run start:admin

# IR App (포트 3000)
pm2 start npm --name "gconnect-ir" -- run start:ir
```

### 10. 프로세스 저장 (재부팅 시 자동 시작)
```bash
pm2 save
pm2 startup
```

### 11. 상태 확인
```bash
pm2 status
pm2 logs gconnect-product
```

---

## 🔄 빠른 배포 스크립트

서버에 다음 스크립트를 생성하면 편리합니다:

**`deploy.sh`**
```bash
#!/bin/bash

echo "🚀 GConnect 배포 시작..."

# 1. Git Pull
echo "📥 최신 코드 받아오기..."
git pull origin main

# 2. 의존성 설치
echo "📦 의존성 설치..."
pnpm install

# 3. Prisma 생성
echo "🔨 Prisma 클라이언트 생성..."
cd packages/db
pnpm prisma generate
cd ../..

# 4. 빌드
echo "🏗️ 빌드 중..."
pnpm build

# 5. PM2 재시작
echo "♻️ 서비스 재시작..."
pm2 restart gconnect-product
pm2 restart gconnect-seller
pm2 restart gconnect-admin
pm2 restart gconnect-ir

echo "✅ 배포 완료!"
pm2 status
```

**스크립트 실행 권한 부여:**
```bash
chmod +x deploy.sh
```

**배포 실행:**
```bash
./deploy.sh
```

---

## 🐳 Docker 배포 (선택사항)

Docker를 사용하는 경우:

```bash
# 이미지 빌드
docker-compose build

# 컨테이너 재시작
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

---

## 🔍 배포 후 확인사항

### 1. 서비스 접근 확인
- Product: `http://서버주소:3002`
- Seller: `http://서버주소:3001`
- Admin: `http://서버주소:3003`
- IR: `http://서버주소:3000`

### 2. DB 연결 확인
```bash
# 로그에서 DB 연결 확인
pm2 logs gconnect-product | grep "DB"
```

### 3. API 테스트
```bash
# 카테고리 API
curl http://localhost:3002/api/categories

# 상품 목록 API
curl http://localhost:3002/api/products-list
```

---

## ⚠️ 주의사항

1. **빌드 시간**: 첫 빌드는 5-10분 정도 소요될 수 있습니다.

2. **메모리**: Next.js 빌드는 많은 메모리를 사용하므로 최소 2GB RAM 권장

3. **포트 충돌**: 각 앱이 사용하는 포트가 열려있는지 확인

4. **환경변수**: 민감한 정보는 절대 Git에 커밋하지 마세요

5. **Prisma**: DB 스키마 변경 시 `pnpm prisma migrate deploy` 실행 필요

6. **DDRo DB**: GLOBAL 상품 데이터를 위해 DDRo DB 연결 필수

---

## 🆘 문제 해결

### 빌드 실패
```bash
# 캐시 삭제 후 재빌드
rm -rf .next
rm -rf node_modules
pnpm install
pnpm build
```

### 프로세스 응답 없음
```bash
# 강제 재시작
pm2 delete all
pm2 start npm --name "gconnect-product" -- run start:product
```

### DB 연결 오류
```bash
# 환경변수 확인
cat .env | grep DATABASE

# Prisma 재생성
cd packages/db
pnpm prisma generate
```

---

## 📞 문의

배포 중 문제가 발생하면 로그를 확인하세요:
```bash
pm2 logs gconnect-product --lines 100
```

