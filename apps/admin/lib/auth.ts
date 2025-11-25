import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@gconnect/db';

// 관리자 계정 (실제로는 DB에 저장하거나 환경 변수로 관리)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@gconnect.com',
  password: process.env.ADMIN_PASSWORD || 'admin1234!@', // 실제로는 해시된 비밀번호
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        // 관리자 계정 확인
        if (
          credentials.email === ADMIN_CREDENTIALS.email &&
          credentials.password === ADMIN_CREDENTIALS.password
        ) {
          return {
            id: 'admin',
            email: ADMIN_CREDENTIALS.email,
            name: 'Admin',
            role: 'ADMIN',
          };
        }

        throw new Error('잘못된 관리자 계정 정보입니다.');
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as any).role || 'ADMIN';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

