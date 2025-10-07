import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message: string
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): { success: boolean; message?: string } => {
    const ip = getClientIP(request)
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()
    const windowStart = now - config.windowMs

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
        resetTime: now + config.windowMs
      })
      return { success: true }
    }

    if (current.resetTime < now) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return { success: true }
    }

    if (current.count >= config.maxRequests) {
      return { 
        success: false, 
        message: config.message 
      }
    }

    current.count++
    return { success: true }
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip || 'unknown'
}

// Rate limit configurations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Muitas requisições. Tente novamente em 1 minuto.'
})

export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3, // 3 payment attempts per minute
  message: 'Muitas tentativas de pagamento. Tente novamente em 1 minuto.'
})
