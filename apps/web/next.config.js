/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Proxy the CDN through our own origin so the player (which sets
    // crossOrigin="anonymous" whenever captions are present) can load the
    // video without the CDN needing CORS headers.
    return [
      {
        source: "/media/:path*",
        destination: "https://cdn.harshsingh.me/:path*",
      },
    ];
  },
};

export default nextConfig;
