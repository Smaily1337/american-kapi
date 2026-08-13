import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["impit", "impit-linux-x64-gnu", "tough-cookie"],
  outputFileTracingIncludes: {
    "/*": [
      "./native/**",
      "./node_modules/impit-linux-x64-gnu/**",
      "./node_modules/impit/**",
    ],
  },
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
