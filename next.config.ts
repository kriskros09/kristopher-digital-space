import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Allow cross-origin requests from your local network IP during development
  allowedDevOrigins: [
    'http://192.168.0.100:3000',
    'http://localhost:3000',
  ],
};

export default nextConfig;
