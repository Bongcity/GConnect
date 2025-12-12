# 🚀 GConnect 실제 서버 배포 가이드

## 📋 목차
1. [사전 준비사항](#-사전-준비사항)
2. [서버 환경 구성](#-서버-환경-구성)
3. [Git 저장소 설정](#-git-저장소-설정)
4. [서버에 배포하기](#-서버에-배포하기)
5. [환경 변수 설정](#-환경-변수-설정)
6. [빌드 및 실행](#-빌드-및-실행)
7. [프로세스 관리 (PM2)](#-프로세스-관리-pm2)
8. [Nginx 리버스 프록시 설정](#-nginx-리버스-프록시-설정)
9. [SSL 인증서 설정](#-ssl-인증서-설정)
10. [문제 해결](#-문제-해결)

---

## 📌 사전 준비사항

### 필요한 것들
- **서버**: Ubuntu 20.04 이상 또는 Windows Server (권장: Ubuntu)
- **도메인**: 
  - `ir.gconnect.kr` (IR 사이트)
  - `www.gconnect.kr` (Product 사이트)
  - `seller.gconnect.kr` (Seller 사이트)
  - `admin.gconnect.kr` (Admin 사이트)
- **데이터베이스**: MSSQL Server (이미 구성됨: 211.195.9.70,14103)
- **Git 저장소**: GitHub, GitLab 등

---

## 🖥️ 서버 환경 구성

### 1. 서버 접속
```bash
# SSH로 서버 접속
ssh username@your-server-ip
```

### 2. Node.js 설치 (Ubuntu)
```bash
# nvm 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Node.js 18 설치
nvm install 18
nvm use 18
nvm alias default 18

# 버전 확인
node -v  # v18.x.x 이상이어야 함
```

### 3. pnpm 설치
```bash
# pnpm 전역 설치
npm install -g pnpm@8.15.0

# 버전 확인
pnpm -v  # 8.15.0
```

### 4. Git 설치
```bash
sudo apt update
sudo apt install git -y

# Git 설정
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 5. PM2 설치 (프로세스 관리자)
```bash
npm install -g pm2

# PM2 확인
pm2 -v
```

---

## 📦 Git 저장소 설정

### 로컬에서 Git 초기화 (처음 한 번만)

**현재 프로젝트 폴더에서:**
```bash
# Git 초기화
git init

# .gitignore 파일 확인 (이미 있어야 함)
# 없다면 생성
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Environment
.env
.env.local
.env.*.local

# Next.js
.next/
out/
build/
dist/

# Misc
.DS_Store
*.log
.turbo/

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/
EOF

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit"

# GitHub/GitLab 저장소 생성 후 연결
git remote add origin https://github.com/your-username/gconnect.git
# 또는 private 저장소
git remote add origin git@github.com:your-username/gconnect.git

# Push
git push -u origin main
```

---

## 🚀 서버에 배포하기

### 1. 서버에서 프로젝트 클론
```bash
# 작업 디렉토리로 이동
cd /home/username

# 또는 웹 서버 디렉토리
cd /var/www

# Git 클론
git clone https://github.com/your-username/gconnect.git

# 프로젝트 디렉토리로 이동
cd gconnect
```

### 2. 권한 설정 (필요한 경우)
```bash
# 현재 사용자에게 권한 부여
sudo chown -R $USER:$USER /var/www/gconnect
```

---

## 🔐 환경 변수 설정

### 루트 디렉토리 `.env.local` 생성
```bash
cd /var/www/gconnect

cat > .env.local << 'EOF'
# 데이터베이스
DATABASE_URL="sqlserver://211.195.9.70,14103;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=true;trustServerCertificate=true"

# 사이트 URL (프로덕션)
NEXT_PUBLIC_IR_URL="https://ir.gconnect.kr"
NEXT_PUBLIC_WEB_URL="https://www.gconnect.kr"
NEXT_PUBLIC_PRODUCT_URL="https://www.gconnect.kr"
NEXT_PUBLIC_SELLER_URL="https://seller.gconnect.kr"
NEXT_PUBLIC_ADMIN_URL="https://admin.gconnect.kr"
EOF
```

### 각 앱별 환경 변수 설정

#### IR 사이트 (`apps/ir/.env.local`)
```bash
cat > apps/ir/.env.local << 'EOF'
DATABASE_URL="sqlserver://211.195.9.70,14103;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=true;trustServerCertificate=true"

NEXT_PUBLIC_IR_URL="https://ir.gconnect.kr"
NEXT_PUBLIC_PRODUCT_URL="https://www.gconnect.kr"
NEXT_PUBLIC_SELLER_URL="https://seller.gconnect.kr"
EOF
```

#### Product 사이트 (`apps/product/.env.local`)
```bash
cat > apps/product/.env.local << 'EOF'
DATABASE_URL="sqlserver://211.195.9.70,14103;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=true;trustServerCertificate=true"

NEXT_PUBLIC_PRODUCT_URL="https://www.gconnect.kr"
NEXT_PUBLIC_SELLER_URL="https://seller.gconnect.kr"
EOF
```

#### Seller 사이트 (`apps/seller/.env.local`)
```bash
cat > apps/seller/.env.local << 'EOF'
DATABASE_URL="sqlserver://211.195.9.70,14103;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=true;trustServerCertificate=true"

# NextAuth
NEXTAUTH_URL="https://seller.gconnect.kr"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production-min-32-chars"

# 네이버 로그인 (있는 경우)
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"

NEXT_PUBLIC_SELLER_URL="https://seller.gconnect.kr"
NEXT_PUBLIC_PRODUCT_URL="https://www.gconnect.kr"
EOF
```

#### Admin 사이트 (`apps/admin/.env.local`)
```bash
cat > apps/admin/.env.local << 'EOF'
DATABASE_URL="sqlserver://211.195.9.70,14103;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=true;trustServerCertificate=true"

# NextAuth
NEXTAUTH_URL="https://admin.gconnect.kr"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production-min-32-chars"

# Admin Credentials
ADMIN_EMAIL="admin@gconnect.com"
ADMIN_PASSWORD="admin1234!@"

NEXT_PUBLIC_ADMIN_URL="https://admin.gconnect.kr"
EOF
```

**⚠️ 주의**: `NEXTAUTH_SECRET`은 반드시 실제 랜덤 문자열로 변경하세요!
```bash
# 랜덤 시크릿 생성
openssl rand -base64 32
```

---

## 🔨 빌드 및 실행

### 1. 의존성 설치
```bash
cd /var/www/gconnect

# 전체 의존성 설치
pnpm install
```

### 2. 데이터베이스 설정
```bash
# Prisma Client 생성
pnpm db:generate

# 스키마 동기화 (개발용 - 처음 한 번만)
pnpm db:push

# 또는 마이그레이션 (프로덕션 권장)
# cd packages/db
# pnpx prisma migrate deploy
```

### 3. 전체 빌드
```bash
# 모든 앱 빌드
pnpm build

# 개별 빌드 (선택사항)
pnpm --filter @gconnect/ir build
pnpm --filter @gconnect/product build
pnpm --filter @gconnect/seller build
pnpm --filter @gconnect/admin build
```

### 4. 프로덕션 실행 테스트
```bash
# IR 사이트 테스트
cd apps/ir
PORT=3001 pnpm start

# 다른 터미널에서
curl http://localhost:3001
```

---

## ⚙️ 프로세스 관리 (PM2)

### PM2 Ecosystem 파일 생성
```bash
cd /var/www/gconnect

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'gconnect-ir',
      cwd: './apps/ir',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '../../logs/ir-error.log',
      out_file: '../../logs/ir-out.log',
      time: true
    },
    {
      name: 'gconnect-product',
      cwd: './apps/product',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '../../logs/product-error.log',
      out_file: '../../logs/product-out.log',
      time: true
    },
    {
      name: 'gconnect-seller',
      cwd: './apps/seller',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '../../logs/seller-error.log',
      out_file: '../../logs/seller-out.log',
      time: true
    },
    {
      name: 'gconnect-admin',
      cwd: './apps/admin',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3004
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '../../logs/admin-error.log',
      out_file: '../../logs/admin-out.log',
      time: true
    }
  ]
};
EOF
```

### PM2 로그 디렉토리 생성
```bash
mkdir -p logs
```

### PM2로 실행
```bash
# 모든 앱 시작
pm2 start ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 특정 앱 로그
pm2 logs gconnect-ir

# 모니터링
pm2 monit
```

### PM2 자동 시작 설정 (서버 재부팅 시)
```bash
# PM2 startup 설정
pm2 startup

# 위 명령 실행 후 출력되는 명령어를 복사해서 실행
# 예: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username

# 현재 실행 중인 앱 저장
pm2 save
```

### PM2 유용한 명령어
```bash
pm2 restart all          # 모든 앱 재시작
pm2 restart gconnect-ir  # 특정 앱 재시작
pm2 stop all             # 모든 앱 중지
pm2 delete all           # 모든 앱 삭제
pm2 reload all           # 무중단 재시작 (cluster mode)
pm2 logs --lines 100     # 최근 100줄 로그
```

---

## 🌐 Nginx 리버스 프록시 설정

### 1. Nginx 설치
```bash
sudo apt update
sudo apt install nginx -y

# Nginx 시작
sudo systemctl start nginx
sudo systemctl enable nginx

# 상태 확인
sudo systemctl status nginx
```

### 2. Nginx 설정 파일 생성

#### IR 사이트 (`ir.gconnect.kr`)
```bash
sudo cat > /etc/nginx/sites-available/ir.gconnect.kr << 'EOF'
server {
    listen 80;
    server_name ir.gconnect.kr;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

#### Product 사이트 (`www.gconnect.kr`)
```bash
sudo cat > /etc/nginx/sites-available/www.gconnect.kr << 'EOF'
server {
    listen 80;
    server_name www.gconnect.kr gconnect.kr;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

#### Seller 사이트 (`seller.gconnect.kr`)
```bash
sudo cat > /etc/nginx/sites-available/seller.gconnect.kr << 'EOF'
server {
    listen 80;
    server_name seller.gconnect.kr;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

#### Admin 사이트 (`admin.gconnect.kr`)
```bash
sudo cat > /etc/nginx/sites-available/admin.gconnect.kr << 'EOF'
server {
    listen 80;
    server_name admin.gconnect.kr;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 3. Nginx 설정 활성화
```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/ir.gconnect.kr /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/www.gconnect.kr /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/seller.gconnect.kr /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.gconnect.kr /etc/nginx/sites-enabled/

# 기본 사이트 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

## 🔒 SSL 인증서 설정

### Let's Encrypt (무료 SSL) 설치
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# 각 도메인에 SSL 인증서 발급
sudo certbot --nginx -d ir.gconnect.kr
sudo certbot --nginx -d www.gconnect.kr -d gconnect.kr
sudo certbot --nginx -d seller.gconnect.kr
sudo certbot --nginx -d admin.gconnect.kr

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

### 인증서 자동 갱신 확인
```bash
# cron 작업이 자동으로 설정됨
sudo systemctl status certbot.timer
```

---

## 🔄 배포 자동화 스크립트

### 업데이트 스크립트 생성 (`deploy.sh`)
```bash
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 GConnect 배포 시작..."

# Git pull
echo "📦 최신 코드 가져오기..."
git pull origin main

# 의존성 업데이트
echo "📦 의존성 설치..."
pnpm install

# 데이터베이스 마이그레이션
echo "🗄️ 데이터베이스 마이그레이션..."
pnpm db:generate

# 빌드
echo "🔨 빌드 중..."
pnpm build

# PM2 재시작
echo "♻️ 서비스 재시작..."
pm2 restart all

echo "✅ 배포 완료!"
pm2 status
EOF

# 실행 권한 부여
chmod +x deploy.sh
```

### 사용법
```bash
# 배포 실행
./deploy.sh
```

---

## 🔍 문제 해결

### 포트가 이미 사용 중
```bash
# 포트 사용 확인
sudo lsof -i :3001
sudo lsof -i :3002

# 프로세스 종료
sudo kill -9 <PID>
```

### PM2 앱이 계속 재시작됨
```bash
# 로그 확인
pm2 logs gconnect-ir --lines 50

# 에러 로그 확인
cat logs/ir-error.log
```

### Nginx 502 Bad Gateway
```bash
# 백엔드 서비스 상태 확인
pm2 status

# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log

# 방화벽 확인
sudo ufw status
sudo ufw allow 'Nginx Full'
```

### 데이터베이스 연결 오류
```bash
# MSSQL 서버 연결 테스트
telnet 211.195.9.70 14103

# 또는
nc -zv 211.195.9.70 14103
```

### 메모리 부족
```bash
# 메모리 사용량 확인
free -h

# PM2 메모리 제한 조정
pm2 stop all
# ecosystem.config.js에서 max_memory_restart 값 증가
pm2 start ecosystem.config.js
```

---

## 📊 모니터링

### PM2 모니터링
```bash
# 실시간 모니터링
pm2 monit

# 웹 대시보드 (선택사항)
pm2 plus
```

### 로그 확인
```bash
# 실시간 로그
pm2 logs

# 특정 앱 로그
pm2 logs gconnect-seller --lines 100

# 에러만 보기
pm2 logs --err
```

### Nginx 로그
```bash
# Access 로그
sudo tail -f /var/log/nginx/access.log

# Error 로그
sudo tail -f /var/log/nginx/error.log
```

---

## ✅ 배포 체크리스트

- [ ] 서버 환경 구성 완료 (Node.js, pnpm, Git, PM2)
- [ ] Git 저장소 생성 및 코드 Push
- [ ] 서버에 Git clone
- [ ] 환경 변수 설정 (`.env.local` 파일들)
- [ ] `NEXTAUTH_SECRET` 랜덤 값으로 변경
- [ ] 의존성 설치 (`pnpm install`)
- [ ] 데이터베이스 설정 (`pnpm db:generate`)
- [ ] 전체 빌드 (`pnpm build`)
- [ ] PM2 ecosystem 파일 생성
- [ ] PM2로 앱 실행 및 테스트
- [ ] PM2 자동 시작 설정
- [ ] Nginx 설치 및 설정
- [ ] Nginx 사이트 활성화
- [ ] DNS 설정 (도메인 → 서버 IP)
- [ ] SSL 인증서 발급
- [ ] 각 사이트 접속 테스트
- [ ] 로그 확인 및 모니터링 설정

---

## 🎯 최종 확인

### 각 사이트 접속 테스트
```bash
# IR 사이트
curl https://ir.gconnect.kr

# Product 사이트
curl https://www.gconnect.kr

# Seller 사이트
curl https://seller.gconnect.kr

# Admin 사이트
curl https://admin.gconnect.kr
```

### PM2 상태 확인
```bash
pm2 status
```

예상 출력:
```
┌────┬─────────────────────┬─────────────┬─────────┬─────────┐
│ id │ name                │ mode        │ ↺       │ status  │
├────┼─────────────────────┼─────────────┼─────────┼─────────┤
│ 0  │ gconnect-ir         │ fork        │ 0       │ online  │
│ 1  │ gconnect-product    │ fork        │ 0       │ online  │
│ 2  │ gconnect-seller     │ fork        │ 0       │ online  │
│ 3  │ gconnect-admin      │ fork        │ 0       │ online  │
└────┴─────────────────────┴─────────────┴─────────┴─────────┘
```

---

## 🔗 참고 자료

- [PM2 공식 문서](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Let's Encrypt 가이드](https://certbot.eff.org/)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

---

**배포 완료! 🎉**

문제가 발생하면 로그를 확인하고, 위의 문제 해결 섹션을 참고하세요.









