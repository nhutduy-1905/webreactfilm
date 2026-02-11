/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      // Proxy movie API calls to backend server
      {
        source: '/api/movies/:path*',
        destination: 'http://localhost:5000/api/movies/:path*',
      },
    ];
  },
}

module.exports = nextConfig
