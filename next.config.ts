import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [{ pathname: "/uploads/**" }, { pathname: "/api/media/**" }],
    remotePatterns: [
      { protocol: "https", hostname: "**.jtvnw.net" },
      { protocol: "https", hostname: "**.twitch.tv" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/uploads/:path*", destination: "/api/media/:path*" }],
    };
  },
};

export default nextConfig;
