import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "/broker" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/broker" : "",
};

export default nextConfig;
