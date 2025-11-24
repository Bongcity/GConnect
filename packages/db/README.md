# @gconnect/db

GConnect 프로젝트의 데이터베이스 패키지 (Prisma + MSSQL)

## 환경 변수 설정

루트 또는 각 앱에 `.env.local` 파일을 생성하고 다음을 추가:

```env
DATABASE_URL="sqlserver://211.195.9.70,14103;database=GCONNECT;user=gconnect_admini;password=@zi9.co.kr#5096;encrypt=true;trustServerCertificate=true"
```

## 명령어

```bash
# Prisma Client 생성
pnpm generate

# 데이터베이스 스키마 푸시 (개발용)
pnpm push

# Prisma Studio 실행
pnpm studio

# 마이그레이션 생성 및 실행
pnpm migrate

# 스키마 포맷팅
pnpm format
```

## 사용법

```typescript
import { prisma } from '@gconnect/db';

// IR 문의 조회
const inquiries = await prisma.iRInquiry.findMany({
  where: { isHandled: false },
  orderBy: { createdAt: 'desc' },
});
```

