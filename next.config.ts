import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    formats: ["image/avif", "image/webp"],
  },
  
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
