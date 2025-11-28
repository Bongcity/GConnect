import { PrismaClient as PrismaClientDDRo } from '@prisma-ddro/client';

// DDRo 외부 데이터베이스 Prisma Client
// 네이버 스마트스토어 GLOBAL 상품 데이터
// 서버: 59.23.231.197,14103

// Singleton 패턴으로 클라이언트 생성
const globalForDDRo = globalThis as unknown as {
  ddroPrisma: PrismaClientDDRo | undefined;
};

// 환경 변수 로딩 확인
if (!globalForDDRo.ddroPrisma) {
  console.log('[DDRo DB] DDRO_DATABASE_URL:', process.env.DDRO_DATABASE_URL ? '✅ 로드됨' : '❌ 없음');
}

export const ddroPrisma =
  globalForDDRo.ddroPrisma ??
  new PrismaClientDDRo({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DDRO_DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDDRo.ddroPrisma = ddroPrisma;
}

// 타입 재export
export type { AffiliateProduct, NaverCategory, NaverCollectionProgress, NaverShoppingKeyword } from '@prisma-ddro/client';
