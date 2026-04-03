/** @type {import('next').NextConfig} */
const nextConfig = {
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
