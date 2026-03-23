import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["panel.olacloud.es", "localhost:3000", "localhost:3001"],
    },
  },
};

export default nextConfig;
