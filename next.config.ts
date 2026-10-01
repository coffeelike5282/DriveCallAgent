import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 정적 PWA 호스팅 최적화
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
