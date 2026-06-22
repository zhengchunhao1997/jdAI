import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async rewrites() {
    const apiBaseUrl = process.env.API_PROXY_TARGET;

    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/backend/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
