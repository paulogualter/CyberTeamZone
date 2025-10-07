import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com; frame-src 'self' https://js.stripe.com;"
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function rateLimit(ip: string, path: string, maxRequests: number, windowMs: number): boolean {
  const key = `${ip}:${path}`
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up expired entries
  Array.from(rateLimitStore.entries()).forEach(([k, v]) => {
    if (v.resetTime < now) {
      rateLimitStore.delete(k)
    }
  })

  const current = rateLimitStore.get(key)

  if (!current) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (current.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (current.count >= maxRequests) {
    return false
  }

  current.count++
  return true
}

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    const ip = getClientIP(req)

    // Apply security headers
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Rate limiting for API routes
    if (pathname.startsWith('/api/')) {
      // Auth routes - stricter rate limiting
      if (pathname.startsWith('/api/auth/')) {
        if (!rateLimit(ip, pathname, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
          return new NextResponse(JSON.stringify({ 
            error: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.' 
          }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
      
      // Payment routes - very strict rate limiting
      if (pathname.startsWith('/api/payments/') || pathname.startsWith('/api/stripe/')) {
        if (!rateLimit(ip, pathname, 3, 60 * 1000)) { // 3 attempts per minute
          return new NextResponse(JSON.stringify({ 
            error: 'Muitas tentativas de pagamento. Tente novamente em 1 minuto.' 
          }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
      
      // General API routes
      if (!rateLimit(ip, pathname, 100, 60 * 1000)) { // 100 requests per minute
        return new NextResponse(JSON.stringify({ 
          error: 'Muitas requisições. Tente novamente em 1 minuto.' 
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Rotas completamente públicas (não precisam de autenticação)
    const publicRoutes = ['/auth/signin', '/auth/signup', '/']
    
    // Rotas que precisam de autenticação mas não de assinatura
    const authRoutes = ['/plans']
    
    // Rotas de admin
    const adminRoutes = ['/admin']
    
    // Rotas de instrutor
    const instructorRoutes = ['/instructor']
    
    // Rotas da área de membros
    const memberRoutes = ['/member']

    // Se é uma rota pública, permitir acesso
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return response
    }

    // Se é uma rota de admin, verificar se é admin
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (token?.role === 'ADMIN') {
        return response
      } else {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    // Se é uma rota de instrutor, verificar se é instrutor
    if (instructorRoutes.some(route => pathname.startsWith(route))) {
      if (token?.role === 'INSTRUCTOR' || token?.role === 'ADMIN') {
        return response
      } else {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    // Se é uma rota da área de membros, verificar se tem assinatura ativa
    if (memberRoutes.some(route => pathname.startsWith(route))) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      
      const subscriptionStatus = (token as any)?.subscriptionStatus || 'INACTIVE'
      const userRole = token.role
      
      // Permitir acesso para admins e instrutores
      if (subscriptionStatus !== 'ACTIVE' && userRole !== 'ADMIN' && userRole !== 'INSTRUCTOR') {
        return NextResponse.redirect(new URL('/plans', req.url))
      }
      
      return response
    }

    // Se é uma rota que precisa de autenticação
    if (authRoutes.some(route => pathname.startsWith(route))) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      
      // Verificar se já tem assinatura ativa
      const subscriptionStatus = (token as any)?.subscriptionStatus || 'INACTIVE'
      if (subscriptionStatus === 'ACTIVE' || token.role === 'ADMIN' || token.role === 'INSTRUCTOR') {
        // Redirecionar instrutores para o dashboard correto
        if (token.role === 'INSTRUCTOR') {
          return NextResponse.redirect(new URL('/instructor', req.url))
        }
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Para outras rotas protegidas (dashboard), verificar se tem assinatura ativa
    if (token) {
      const subscriptionStatus = (token as any)?.subscriptionStatus || 'INACTIVE'
      
      // Redirecionar instrutores para o dashboard correto
      if (token.role === 'INSTRUCTOR' && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/instructor', req.url))
      }
      
      if (subscriptionStatus !== 'ACTIVE' && token.role !== 'ADMIN' && token.role !== 'INSTRUCTOR') {
        return NextResponse.redirect(new URL('/plans', req.url))
      }
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Rotas públicas não precisam de token
        const publicRoutes = ['/auth/signin', '/auth/signup', '/']
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // Outras rotas precisam de token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/instructor/:path*',
    '/member/:path*',
    '/auth/signin',
    '/auth/signup',
    '/plans',
    '/',
    '/api/:path*'
  ]
}