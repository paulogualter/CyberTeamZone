'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface SmartCourseImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackIcon?: string
}

const SmartCourseImage: React.FC<SmartCourseImageProps> = ({ 
  src, 
  alt, 
  className = "w-full h-full object-cover",
  fallbackIcon = "🛡️"
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)

  useEffect(() => {
    setImageLoading(true)
    setImageError(false)
    
    if (!src) {
      setCurrentSrc(null)
      setImageLoading(false)
      return
    }

    // Se é uma URL da API de imagens do banco de dados
    if (src.startsWith('/api/images/')) {
      setCurrentSrc(src)
      return
    }

    // Se é um filename da pasta uploads, tentar diferentes estratégias
    if (src && !src.startsWith('http') && !src.startsWith('/api/')) {
      // Se já tem prefixo /uploads/, remover e usar apenas o filename
      let filename = src
      if (src.startsWith('/uploads/')) {
        filename = src.replace('/uploads/', '')
      }
      
      // Estratégia 1: Tentar API local primeiro (só funciona se a imagem estiver deployada)
      setCurrentSrc(`/api/uploads/${filename}`)
      return
    }

    // Caso contrário, usar como está
    setCurrentSrc(src)
  }, [src])

  const handleImageError = () => {
    console.log(`⚠️ Failed to load image: ${currentSrc}`)
    
    // Se falhou ao carregar via API local, tentar outras estratégias
    if (currentSrc?.startsWith('/api/uploads/') && src && !src.startsWith('http') && !src.startsWith('/api/')) {
      console.log(`🔄 Trying fallback strategies for: ${src}`)
      
      // Extrair filename correto (remover prefixo /uploads/ se existir)
      let filename = src
      if (src.startsWith('/uploads/')) {
        filename = src.replace('/uploads/', '')
      }
      
      // Estratégia 2: Tentar acessar diretamente da pasta public (só funciona em dev)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Trying direct public path: /uploads/${filename}`)
        setCurrentSrc(`/uploads/${filename}`)
        return
      }
      
      // Estratégia 3: Tentar URL absoluta (para produção)
      console.log(`🔄 Trying absolute URL: ${window.location.origin}/api/uploads/${filename}`)
      setCurrentSrc(`${window.location.origin}/api/uploads/${filename}`)
      return
    }
    
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully: ${currentSrc}`)
    setImageLoading(false)
  }

  if (!currentSrc || imageError) {
    // Usar imagem do Unsplash como fallback
    const fallbackImages = [
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
    ]
    
    // Usar hash do alt para escolher uma imagem consistente
    const hash = alt.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    const fallbackImage = fallbackImages[Math.abs(hash) % fallbackImages.length]
    
    return (
      <div className="relative w-full h-full">
        <Image
          src={fallbackImage}
          alt={`Fallback for ${alt}`}
          fill
          className={className}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          unoptimized={true}
        />
        {/* Overlay com ícone */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="text-white text-4xl opacity-80">{fallbackIcon}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {imageLoading && (
        <div className={`absolute inset-0 ${className} flex items-center justify-center bg-gradient-to-br from-yellow-600 to-purple-600`}>
          <div className="text-white text-2xl">⏳</div>
        </div>
      )}
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
        unoptimized={true}
      />
    </div>
  )
}

export default SmartCourseImage
