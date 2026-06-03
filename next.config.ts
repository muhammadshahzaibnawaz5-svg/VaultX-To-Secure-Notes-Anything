import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Railway and other container-based PaaS deployments.
  // Produces a self-contained server bundle in .next/standalone/
  output: "standalone",
};

export default nextConfig;
