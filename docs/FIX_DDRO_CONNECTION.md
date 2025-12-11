# DDRo DB 연결 오류 해결

## 🐛 오류 메시지
```
error: Error validating datasource `db`: the URL must start with the protocol `sqlserver://`.
```

## 🔍 원인
Prisma 클라이언트가 캐시되어 있어, `.env.local`의 `DDRO_DATABASE_URL` 변경사항이 반영되지 않음

## ✅ 해결 방법

### 1단계: 환경변수 확인
```powershell
cd D:\GConnect\apps\product
Get-Content .env.local | Select-String "DDRO_DATABASE_URL"
```

**올바른 형식**:
```env
DDRO_DATABASE_URL="sqlserver://59.23.231.197:14103;database=DDRo;user=USERNAME;password=PASSWORD;encrypt=true;trustServerCertificate=true"
```

### 2단계: Prisma 클라이언트 재생성
```powershell
cd D:\GConnect

# 기존 Prisma DDRo 클라이언트 삭제
Remove-Item -Recurse -Force node_modules/@prisma-ddro

# Prisma 클라이언트 재생성
cd packages\db
npx prisma generate --schema=prisma/schema-ddro.prisma
```

### 3단계: Next.js 캐시 삭제
```powershell
cd D:\GConnect\apps\product
Remove-Item -Recurse -Force .next
```

### 4단계: 앱 재시작
```powershell
# Product 앱 (Ctrl+C로 기존 프로세스 종료 후)
cd D:\GConnect\apps\product
pnpm dev
```

## 🎯 예상 결과

**수정 전**:
```
[getGlobalProducts] DDRo DB 연결 시도 (Raw SQL)...
prisma:error Invalid `prisma.$queryRaw()` invocation...
[getGlobalProducts] Mock GLOBAL 상품으로 대체...
```

**수정 후**:
```
[getGlobalProducts] DDRo DB 연결 시도 (Raw SQL)...
prisma:query SELECT * FROM affiliate_products...
[getGlobalProducts] ✅ 12개 조회 완료
[getComposedProducts] SELLER: 8개, GLOBAL: 12개
```

## 📌 주의사항

### Prisma 환경변수 변경 시 항상 재생성 필요
- `.env.local`의 데이터베이스 연결 문자열 변경 시
- `schema.prisma` 또는 `schema-ddro.prisma` 수정 시
- 반드시 `prisma generate` 실행

### SQL Server 연결 문자열 포맷
| 항목 | ADO.NET (❌) | Prisma (✅) |
|------|-------------|-----------|
| 프로토콜 | `Server=` | `sqlserver://` |
| 포트 구분 | `,` (쉼표) | `:` (콜론) |
| 데이터베이스 | `Database=` | `database=` |
| 사용자 | `User Id=` | `user=` |
| 비밀번호 | `Password=` | `password=` |

### 예시
```env
# ❌ ADO.NET 형식 (Prisma 불가)
DDRO_DATABASE_URL="Server=59.23.231.197,14103;Database=DDRo;User Id=sa;Password=pass;"

# ✅ Prisma 형식 (필수)
DDRO_DATABASE_URL="sqlserver://59.23.231.197:14103;database=DDRo;user=sa;password=pass;encrypt=true;trustServerCertificate=true"
```

## 🔧 트러블슈팅

### 여전히 오류 발생 시
```powershell
# 1. 모든 node_modules 삭제 후 재설치
cd D:\GConnect
Remove-Item -Recurse -Force node_modules
pnpm install

# 2. 모든 Prisma 클라이언트 재생성
cd packages\db
pnpm prisma generate --schema=prisma/schema.prisma
pnpm prisma generate --schema=prisma/schema-ddro.prisma

# 3. 모든 앱의 .next 캐시 삭제
cd ..\..\apps\product
Remove-Item -Recurse -Force .next

cd ..\seller
Remove-Item -Recurse -Force .next

cd ..\admin
Remove-Item -Recurse -Force .next

# 4. 앱 재시작
```

### 환경변수 로드 확인
```typescript
// packages/db/index.ts에서 확인
console.log('[DDRo DB] DDRO_DATABASE_URL:', 
  process.env.DDRO_DATABASE_URL ? '✅ 로드됨' : '❌ 없음'
);
```

## 📚 관련 문서
- [Prisma SQL Server 연결](https://www.prisma.io/docs/concepts/database-connectors/sql-server)
- [Next.js 환경변수](https://nextjs.org/docs/basic-features/environment-variables)
- [schema-ddro.prisma](../packages/db/prisma/schema-ddro.prisma)

---

**2025-12-11 작성**

