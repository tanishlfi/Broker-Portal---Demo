/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: {
      displayName: false,
    },
  },
  // reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.randmutual.co.za",
        pathname: "**",
      },
    ],
  },
  async rewrites() {
    const brokerPortalUrl = process.env.BROKER_PORTAL_URL || "http://localhost:3000";
    return [
      {
        source: "/brokerPortal",
        destination: `${brokerPortalUrl}/brokerPortal`,
      },
      {
        source: "/brokerPortal/:path+",
        destination: `${brokerPortalUrl}/brokerPortal/:path+`,
      },
    ];
  },
};

module.exports = nextConfig;
