import { PrismaClient } from '@prisma/client';

// Prisma Client 싱글톤 인스턴스
// 개발 환경에서 hot reload 시 연결이 누적되는 것을 방지
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 환경 변수 로딩 확인
if (!globalForPrisma.prisma) {
  console.log('[GCONNECT DB] DATABASE_URL:', process.env.DATABASE_URL ? '✅ 로드됨' : '❌ 없음');
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 타입 및 유틸리티 re-export
export * from '@prisma/client';

// DDRo 외부 데이터베이스 (GLOBAL 상품용)
export { ddroPrisma } from './src/ddro';
export type { 
  AffiliateProduct,
  NaverCategory, 
  NaverCollectionProgress, 
  NaverShoppingKeyword 
} from '@prisma-ddro/client';

// Raw SQL 조회 시 JOIN된 카테고리 정보를 포함하는 확장 타입
import type { AffiliateProduct } from '@prisma-ddro/client';
export type GlobalAffiliateProduct = AffiliateProduct & {
  source_category_name?: string | null;
};

