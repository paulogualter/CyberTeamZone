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
    // Force resolution of paths
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
      '@/components': require('path').resolve(__dirname, './components'),
      '@/lib': require('path').resolve(__dirname, './lib'),
      '@/hooks': require('path').resolve(__dirname, './hooks'),
      '@/types': require('path').resolve(__dirname, './types'),
    }
    
    // Force resolution of extensions
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
    
    // Force resolution of modules
    config.resolve.modules = [
      require('path').resolve(__dirname, '.'),
      'node_modules'
    ]
    
    return config
  },
}

module.exports = nextConfig