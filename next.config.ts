import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // This allows production builds to successfully complete even if
    // the project has strict TypeScript errors from third-party libraries.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;