import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    console.log('🔍 Middleware triggered for:', pathname)
    console.log('🔑 Token data:', { 
      hasToken: !!token, 
      role: token?.role, 
      id: token?.id 
    })

    // Se é uma rota de admin, verificar se é admin
    if (pathname.startsWith('/admin')) {
      if (!token) {
        console.log('🔒 No token for /admin, redirecting to login')
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      
      if (token.role !== 'ADMIN') {
        console.log('🔒 User is not ADMIN, redirecting to login')
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      
      console.log('✅ User is ADMIN, allowing access to /admin')
    }

    // Se é uma rota de instrutor, verificar se é instrutor ou admin
    if (pathname.startsWith('/instructor')) {
      if (!token) {
        console.log('🔒 No token for /instructor, redirecting to login')
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      
      if (token.role !== 'INSTRUCTOR' && token.role !== 'ADMIN') {
        console.log('🔒 User is not INSTRUCTOR or ADMIN, redirecting to login')
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      
      console.log('✅ User is INSTRUCTOR/ADMIN, allowing access to /instructor')
    }

    // Para outras rotas protegidas, verificar se tem token
    if (pathname.startsWith('/member') || pathname.startsWith('/dashboard')) {
      if (!token) {
        console.log('🔒 No token for protected route, redirecting to login')
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      
      console.log('✅ User has token, allowing access to protected route')
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        console.log('🔍 Authorized callback for:', pathname)
        console.log('🔑 Token in authorized:', { 
          hasToken: !!token, 
          role: token?.role 
        })

        // Rotas públicas não precisam de token
        const publicRoutes = ['/auth/signin', '/auth/signup', '/']
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          console.log('✅ Public route, allowing access')
          return true
        }

        // Para rotas protegidas, verificar se tem token
        const protectedRoutes = ['/admin', '/instructor', '/member', '/dashboard']
        if (protectedRoutes.some(route => pathname.startsWith(route))) {
          if (!token) {
            console.log('❌ Protected route without token, denying access')
            return false
          }
          
          console.log('✅ Protected route with token, allowing access')
          return true
        }

        console.log('✅ Other route, allowing access')
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/instructor/:path*',
    '/member/:path*',
    '/dashboard/:path*'
  ]
}