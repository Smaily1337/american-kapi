import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["impit", "impit-linux-x64-gnu", "tough-cookie"],
  outputFileTracingIncludes: {
    "*": ["./native/**"],
    "/": ["./native/**"],
    "/ogloszenia": ["./native/**"],
    "/ogloszenia/[id]": ["./native/**"],
    "/api/copart/search": ["./native/**"],
    "/api/copart/lot/[lot]": ["./native/**"],
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
