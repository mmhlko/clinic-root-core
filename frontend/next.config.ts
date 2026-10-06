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
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      }
    ];
  },
};

export default nextConfig;