import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/student/:path*', destination: '/platform/learning', permanent: false },
      { source: '/teacher/:path*', destination: '/platform/teacher', permanent: false },
      { source: '/leader/:path*', destination: '/platform/teacher/report', permanent: false },
      { source: '/operator/:path*', destination: '/platform/manage', permanent: false },
    ];
  },
  distDir: process.env.NODE_ENV === "production" ? ".next-production" : ".next",
};

export default nextConfig;
