# 환경 변수 설정 가이드

## 필수 환경 변수

### 1. GCONNECT 메인 데이터베이스 (SELLER 상품)

```bash
DATABASE_URL="sqlserver://21.195.9.70;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=false"
```

### 2. DDRo 외부 데이터베이스 (GLOBAL 상품)

```bash
DDRO_DATABASE_URL="sqlserver://59.23.231.197,14103;database=DDRo;user=1stplatfor_sql;password=@allin#am1071;encrypt=false;trustServerCertificate=true"
```

## 설정 방법

1. `apps/product/.env.local` 파일 생성
2. 위의 환경 변수 복사/붙여넣기
3. 필요 시 패스워드 변경

## Prisma Client 생성

```bash
cd packages/db
pnpm generate
```

이 명령은 다음 두 개의 Prisma Client를 생성합니다:
- `@prisma/client` - GCONNECT DB용 (SELLER 상품)
- `@prisma-ddro/client` - DDRo DB용 (GLOBAL 상품)

