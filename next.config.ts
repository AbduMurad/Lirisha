import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photography is portrait and served from /public. These are the
    // only widths the grid ever requests, which keeps the srcset short.
    imageSizes: [64, 96, 128, 256, 384],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1600, 1920],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
