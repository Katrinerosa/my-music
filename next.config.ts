import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-images.dzcdn.net",
      },
      {
        protocol: "https",
        hostname: "api.deezer.com",
      },
      {
        protocol: "https",
        hostname: "lastfm.freetls.fastly.net",
      },
      {
        protocol: "https",
        hostname: "lastfm-img2.akamaized.net",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
    ],
  },
};

export default nextConfig;
