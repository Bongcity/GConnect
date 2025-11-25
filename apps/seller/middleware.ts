export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    // 다른 보호된 경로를 여기에 추가
  ],
};

