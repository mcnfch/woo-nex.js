/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'ggbe.groovygallerydesigns.com', 
      'i0.wp.com',
      'ae01.alicdn.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      // Handle AliExpress images embedded in WordPress URLs
      {
        source: '/aliexpress-image/:path*',
        destination: 'https://ae01.alicdn.com/:path*',
      },
    ];
  },
}

module.exports = nextConfig
