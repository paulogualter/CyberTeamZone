/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'supabase.co', 'images.unsplash.com', 'blob.vercel-storage.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configuração mais simples para evitar problemas de chunk loading
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
    }
    
    // Configuração para evitar problemas de self is not defined
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
  // Configuração de output para melhor cache
  generateEtags: false,
  poweredByHeader: false,
  // Headers de segurança para resolver CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
                 {
                   key: 'Content-Security-Policy',
                   value: [
                     "default-src 'self'",
                     "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https: http:",
                     "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https: http:",
                     "style-src 'self' 'unsafe-inline' https: http:",
                     "img-src 'self' data: blob: https: http:",
                     "font-src 'self' data: https: http:",
                     "connect-src 'self' https: http: ws: wss:",
                     "media-src 'self' blob: https: http:",
                     "frame-src 'self' https: http:",
                     "object-src 'none'",
                     "base-uri 'self'",
                     "form-action 'self'",
                     "frame-ancestors 'none'",
                     "upgrade-insecure-requests"
                   ].join('; ')
                 },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig