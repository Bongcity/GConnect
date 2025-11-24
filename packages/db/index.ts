import { PrismaClient } from '@prisma/client';

// Prisma Client 싱글톤 인스턴스
// 개발 환경에서 hot reload 시 연결이 누적되는 것을 방지
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 타입 및 유틸리티 re-export
export * from '@prisma/client';

