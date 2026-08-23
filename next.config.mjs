/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
        {
          source: '/socket.io/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/socket.io/:path*`,
        }
      ];
    }
    return [];
  }
};

export default nextConfig;
