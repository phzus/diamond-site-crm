import type { NextConfig } from 'next'

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://zcwgxmoibuxskhmbtzka.supabase.co;
  font-src 'self';
  connect-src 'self' https://zcwgxmoibuxskhmbtzka.supabase.co wss://zcwgxmoibuxskhmbtzka.supabase.co;
  frame-ancestors 'none';
`.replace(/\n/g, ' ')

const nextConfig: NextConfig = {
  transpilePackages: ['recharts'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy',  value: cspHeader },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
