import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Clerk serves user/collaborator avatars from these hosts; next/image needs
    // them allow-listed or it throws "hostname is not configured under images".
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
};

export default nextConfig;
