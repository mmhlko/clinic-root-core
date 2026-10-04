import type { NextConfig } from 'next';
const backendUrl = process.env.BACKEND_API_URL ?? 'http://localhost:3001';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;