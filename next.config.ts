import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.101"],
  images: {
    localPatterns: [
      {
        pathname: "/api/blob",
      },
      {
        pathname: "/api/blob/**",
      },
      {
        pathname: "/uploads/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "**.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
