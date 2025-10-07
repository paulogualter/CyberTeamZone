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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
      '@/components': require('path').resolve(__dirname, './components'),
      '@/lib': require('path').resolve(__dirname, './lib'),
      '@/hooks': require('path').resolve(__dirname, './hooks'),
      '@/types': require('path').resolve(__dirname, './types'),
    }
    return config
  },
}

module.exports = nextConfig