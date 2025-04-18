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
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.groovygallerydesigns.com https://i0.wp.com https://ae01.alicdn.com; font-src 'self'; connect-src 'self' https://api.stripe.com; frame-src 'self' https://js.stripe.com; object-src 'none';"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
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
