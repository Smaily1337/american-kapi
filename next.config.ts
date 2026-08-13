import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["impit", "tough-cookie"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cs.copart.com",
      },
      {
        protocol: "https",
        hostname: "c-static.copart.com",
      },
    ],
  },
};

export default nextConfig;
