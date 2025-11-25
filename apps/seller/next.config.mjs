/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gconnect/db', '@gconnect/lib', '@gconnect/ui'],
  experimental: {
    instrumentationHook: true,
  },
  // Static export 비활성화 (API 라우트가 있는 앱은 static export 불가)
  output: 'standalone',
};

export default nextConfig;

