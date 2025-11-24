/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gconnect/db', '@gconnect/lib', '@gconnect/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

