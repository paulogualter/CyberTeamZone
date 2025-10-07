import React from 'react'

// Otimizações de performance para produção

// Cache de consultas frequentes
const queryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export function getCachedQuery<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = queryCache.get(key)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return Promise.resolve(cached.data)
  }
  
  return fetcher().then(data => {
    queryCache.set(key, { data, timestamp: now })
    return data
  })
}

// Limpeza periódica do cache
setInterval(() => {
  const now = Date.now()
  Array.from(queryCache.entries()).forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_TTL) {
      queryCache.delete(key)
    }
  })
}, CACHE_TTL)

// Compressão de imagens
export function optimizeImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return url
  
  // Se for uma imagem local, retornar como está
  if (url.startsWith('/')) return url
  
  // Para imagens externas, adicionar parâmetros de otimização
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', '80') // Qualidade 80%
  params.set('f', 'webp') // Formato WebP
  
  return `${url}?${params.toString()}`
}

// Lazy loading de componentes
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc)
}

// Debounce para pesquisas
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle para eventos frequentes
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Preload de recursos críticos
export function preloadResource(href: string, as: string) {
  if (typeof window === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Otimização de bundle
export const dynamicImports = {
  // Componentes pesados
  VideoPlayer: () => import('@/components/VideoPlayer'),
  CourseCatalog: () => import('@/components/CourseCatalog'),
  AdminDashboard: () => import('@/components/AdminDashboard'),
  
  // Páginas
  AdminPage: () => import('@/app/admin/page'),
}

// Configurações de performance
export const PERFORMANCE_CONFIG = {
  // Cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  MAX_CACHE_SIZE: 100, // Máximo 100 itens no cache
  
  // Imagens
  DEFAULT_IMAGE_QUALITY: 80,
  DEFAULT_IMAGE_FORMAT: 'webp',
  MAX_IMAGE_WIDTH: 1920,
  MAX_IMAGE_HEIGHT: 1080,
  
  // Debounce/Throttle
  SEARCH_DEBOUNCE: 300, // 300ms
  SCROLL_THROTTLE: 100, // 100ms
  RESIZE_THROTTLE: 250, // 250ms
  
  // Lazy loading
  LAZY_LOAD_OFFSET: 100, // 100px antes de entrar na viewport
  
  // Bundle splitting
  CHUNK_SIZE_LIMIT: 250000, // 250KB por chunk
}
