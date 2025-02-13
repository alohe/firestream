import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', "fire.quicky.dev"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb'
    }
  }
};

export default nextConfig;
