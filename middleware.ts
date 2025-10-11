import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Remover completamente todos os headers de CSP e segurança
  response.headers.delete('Content-Security-Policy')
  response.headers.delete('Content-Security-Policy-Report-Only')
  response.headers.delete('X-Content-Type-Options')
  response.headers.delete('X-Frame-Options')
  response.headers.delete('Referrer-Policy')
  response.headers.delete('X-XSS-Protection')
  response.headers.delete('Cross-Origin-Embedder-Policy')
  response.headers.delete('Cross-Origin-Opener-Policy')
  response.headers.delete('Cross-Origin-Resource-Policy')
  
  // Adicionar headers permissivos para desenvolvimento e produção
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none')
  response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none')
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin')
  
  // Definir CSP completamente permissivo
  response.headers.set('Content-Security-Policy', 
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
    "script-src * 'unsafe-inline' 'unsafe-eval'; " +
    "style-src * 'unsafe-inline'; " +
    "img-src * data: blob:; " +
    "font-src *; " +
    "connect-src *; " +
    "media-src *; " +
    "object-src *; " +
    "child-src *; " +
    "frame-src *; " +
    "worker-src *; " +
    "frame-ancestors *;"
  )
  
  console.log('✅ Middleware: CSP set to permissive for:', request.url)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}