import type { NextConfig } from "next";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Enable standalone mode for Docker
  output: "standalone",

  async rewrites() {
    const isKubernetes = !!process.env.KUBERNETES_SERVICE_HOST;
    const internalApi =
      process.env.INTERNAL_API_URL ??
      (isKubernetes ? "http://backend:8000" : "http://localhost:8000");
    const destinationBase = trimTrailingSlash(internalApi.trim());

    // Proxy API calls through the Next.js server so the browser only talks to
    // the frontend origin (avoids CORS + avoids relying on cluster-internal DNS).
    return [
      {
        source: "/api/:path*",
        destination: `${destinationBase}/api/:path*`,
      },
    ];
  },
  
  /* Add other config options here */
};

export default nextConfig;
