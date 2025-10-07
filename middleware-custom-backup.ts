import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rotas que precisam de autenticação
  const protectedRoutes = ['/admin', '/instructor', '/member', '/dashboard']
  
  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    // Verificar se há token de sessão
    const sessionToken = request.cookies.get('next-auth.session-token') || 
                        request.cookies.get('__Secure-next-auth.session-token')
    
    if (!sessionToken) {
      console.log('🔒 No session token found, redirecting to login')
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    // Para rotas de admin, verificar se o token contém role ADMIN
    if (pathname.startsWith('/admin')) {
      // Decodificar o token JWT para verificar o role
      try {
        const tokenPayload = JSON.parse(atob(sessionToken.value.split('.')[1]))
        if (tokenPayload.role !== 'ADMIN') {
          console.log('🔒 User is not ADMIN, redirecting to login')
          return NextResponse.redirect(new URL('/auth/signin', request.url))
        }
      } catch (error) {
        console.log('🔒 Invalid token, redirecting to login')
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/instructor/:path*',
    '/member/:path*',
    '/dashboard/:path*'
  ]
}
