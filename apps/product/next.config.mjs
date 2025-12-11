/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gconnect/db', '@gconnect/lib', '@gconnect/ui'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ];
  },
};

export default nextConfig;

