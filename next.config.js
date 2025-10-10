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
  // Remover CSP completamente - versão mais agressiva
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ''
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: ''
          },
          {
            key: 'X-Content-Type-Options',
            value: ''
          },
          {
            key: 'X-Frame-Options',
            value: ''
          },
          {
            key: 'Referrer-Policy',
            value: ''
          },
          {
            key: 'X-XSS-Protection',
            value: ''
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: ''
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: ''
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: ''
          }
        ],
      },
    ]
  }
}

module.exports = nextConfig