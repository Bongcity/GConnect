/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gconnect/db', '@gconnect/lib', '@gconnect/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '*.pstatic.net', // 네이버 이미지
      },
      {
        protocol: 'https',
        hostname: 'shopping-phinf.pstatic.net', // 네이버 쇼핑 이미지
      },
      {
        protocol: 'https',
        hostname: 'shop-phinf.pstatic.net', // 네이버 스마트스토어 이미지
      },
    ],
  },
};

export default nextConfig;

