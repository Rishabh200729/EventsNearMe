/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack persistent caching in dev mode to prevent file lock/UNKNOWN errors
      config.cache = false;
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.INTERNAL_BACKEND_URL ? `${process.env.INTERNAL_BACKEND_URL}/:path*` : 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
