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

    // Se é um filename da pasta uploads, usar a API local
    if (src && !src.startsWith('http') && !src.startsWith('/api/')) {
      setCurrentSrc(`/api/uploads/${src}`)
      return
    }

    // Caso contrário, usar como está
    setCurrentSrc(src)
  }, [src])

  const handleImageError = () => {
    console.log(`⚠️ Failed to load image: ${currentSrc}`)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully: ${currentSrc}`)
    setImageLoading(false)
  }

  if (!currentSrc || imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600`}>
        <div className="text-white text-6xl">{fallbackIcon}</div>
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
