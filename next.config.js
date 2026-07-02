/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['whatsapp-web.js', 'puppeteer'],
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/static/:path*',
      },
    ];
  },
  async redirects() {
    return [
      { source: '/store', destination: '/services', permanent: true },
      { source: '/product/:path*', destination: '/services', permanent: true },
      { source: '/booking', destination: '/request-move', permanent: true },
      { source: '/checkout', destination: '/request-move', permanent: true },
      { source: '/media', destination: '/our-work', permanent: true },
      { source: '/track', destination: '/track-request', permanent: true },
      { source: '/policy', destination: '/service-policy', permanent: true },
      { source: '/login', destination: '/customer/login', permanent: true },
      { source: '/account', destination: '/my-requests', permanent: true },
      { source: '/fulfillment', destination: '/scpanel/operations', permanent: true },
    ];
  },
};

module.exports = nextConfig;
