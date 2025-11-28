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
};

export default nextConfig;

