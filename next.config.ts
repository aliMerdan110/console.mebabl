import type { NextConfig } from "next";

const apiBaseUrl = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.mebabl.com"
    : "http://localhost:5094")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/developers/:path*",
        destination: `${apiBaseUrl}/api/developers/:path*`,
      },
      {
        source: "/api/applications/:path*",
        destination: `${apiBaseUrl}/api/applications/:path*`,
      },
      {
        source: "/api/application-auth/:path*",
        destination: `${apiBaseUrl}/api/application-auth/:path*`,
      },
      {
        source: "/api/sdk/:path*",
        destination: `${apiBaseUrl}/api/sdk/:path*`,
      },
    ];
  },
};

export default nextConfig;