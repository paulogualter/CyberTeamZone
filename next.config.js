/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'supabase.co', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
      '@/components': require('path').resolve(__dirname, './components'),
      '@/lib': require('path').resolve(__dirname, './lib'),
      '@/hooks': require('path').resolve(__dirname, './hooks'),
      '@/types': require('path').resolve(__dirname, './types'),
    }
    
    // Force resolution of .ts and .tsx files
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
    
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig