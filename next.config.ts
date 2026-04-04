import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Next.js 15 property
  allowedDevOrigins: ["0.0.0.0", "localhost", "tic-tac-toe-multiplayer-ruby.vercel.app"]
} as any;

export default nextConfig;
