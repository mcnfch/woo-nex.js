import { NextRequest, NextResponse } from 'next/server';

// Simple function to log requests with IP addresses
function logRequest(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    // Get IP from x-forwarded-for header, which is typically set by proxies/load balancers
    const forwardedFor = request.headers.get('x-forwarded-for');
    // Split the header value and get the first IP which is usually the client's real IP
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Log to console only (file logging not supported in Edge Runtime)
    console.log(`${timestamp} | IP: ${ip} | ${method} ${url} | UA: ${userAgent}`);
  } catch (error) {
    console.error('Error logging request:', error);
  }
}

export function middleware(request: NextRequest) {
  // Log the request with IP address
  logRequest(request);

  // Get the response
  const response = NextResponse.next();

  // Set Content Security Policy header to allow Google Tag Manager and Analytics
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net;
    connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://stats.g.doubleclick.net https://www.merchant-center-analytics.goog https://pagead2.googlesyndication.com https://www.googletagmanager.com;
    img-src 'self' data: https://*.groovygallerydesigns.com https://i0.wp.com https://ae01.alicdn.com https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com;
    style-src 'self' 'unsafe-inline';
    font-src 'self' data:;
    frame-src 'self' https://js.stripe.com https://www.googletagmanager.com;`
      .replace(/\s+/g, ' ')
      .trim()
  );

  return response;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
