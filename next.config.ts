import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/JLPT-GAME',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
