/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gconnect/db', '@gconnect/lib', '@gconnect/ui'],
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;

