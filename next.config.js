/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    domains: ['lh3.googleusercontent.com', 'images.unsplash.com', 'via.placeholder.com'],
  },
  
  // Configurações de segurança
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  
  // Configurações para produção
  trailingSlash: false,
  
  // Configurações de build
  swcMinify: true,
  
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com https://vercel.live https://vitals.vercel-insights.com https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://apis.google.com; script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.stripe.com https://*.stripe.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' ws: wss: blob: data: https://api.stripe.com https://api.mercadopago.com https://vitals.vercel-insights.com https://accounts.google.com https://apis.google.com; frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com https://www.mercadopago.com https://www.youtube.com https://youtube.com https://pandavideo.com https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
              : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com https://vercel.live https://vitals.vercel-insights.com https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://apis.google.com; script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.stripe.com https://*.stripe.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://api.mercadopago.com https://vitals.vercel-insights.com https://accounts.google.com https://apis.google.com; frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://*.stripe.com https://www.mercadopago.com https://www.youtube.com https://youtube.com https://pandavideo.com https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
          }
        ]
      }
    ]
  },
  
      // Configurações de redirecionamento removidas para evitar loops
  
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  },
}

module.exports = nextConfig