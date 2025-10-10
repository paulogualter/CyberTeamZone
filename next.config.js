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
  // Desabilitar CSP completamente - versão mais agressiva
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src *; connect-src *; frame-src *; object-src *; media-src *; manifest-src *; worker-src *; child-src *; form-action *; base-uri *;"
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
          }
        ],
      },
    ]
  }
}

module.exports = nextConfig