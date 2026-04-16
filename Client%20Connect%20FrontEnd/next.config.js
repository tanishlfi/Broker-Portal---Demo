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
    return [
      {
        source: "/brokerPortal",
        destination: "https://broker-portal-demo-two.vercel.app/dashboard",
      },
      {
        source: "/brokerPortal/:path+",
        destination: "https://broker-portal-demo-two.vercel.app/:path+",
      },
     {
        source: "/brokerPortal-static/_next/:path+",
        destination: "https://broker-portal-demo-two.vercel.app/brokerPortal-static/_next/:path+",
      },
    ];
  },
};

module.exports = nextConfig;
