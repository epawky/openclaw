/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // For VPS deployment behind nginx reverse proxy
  async rewrites() {
    // In production, API calls are proxied by nginx
    // In development, we proxy to the local FastAPI server
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
