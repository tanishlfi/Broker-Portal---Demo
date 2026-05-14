import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/adminPortal",
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/cc/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
