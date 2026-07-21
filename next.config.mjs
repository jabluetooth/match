/** @type {import('next').NextConfig} */
// Reasonably strict but not maximally strict: 'unsafe-eval' is needed for
// Next.js dev-mode HMR, and 'unsafe-inline' for style-src is needed because
// Clerk's hosted auth components inject inline styles. This can be tightened
// further later with per-request nonces if desired.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: CSP },
];

const nextConfig = {
  // No remote images are actually used anywhere in the app (the only
  // next/image usage renders a local static asset). No remotePatterns
  // needed — leaving images.domains/remotePatterns unset denies all
  // remote image hosts by default.
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
