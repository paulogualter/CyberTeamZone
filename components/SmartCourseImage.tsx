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

  useEffect(() => {
    setImageLoading(true)
    setImageError(false)
  }, [src])

  const handleImageError = () => {
    console.log(`⚠️ Failed to load image for: ${alt}`)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    console.log(`✅ Successfully loaded image for: ${alt}`)
    setImageLoading(false)
  }

  // Se não há src ou houve erro, mostrar fallback
  if (!src || imageError) {
    const fallbackImages = [
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
    ]
    
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
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="text-white text-4xl opacity-80">{fallbackIcon}</div>
        </div>
      </div>
    )
  }

  // Se é uma data URL base64, usar tag img normal
  if (src.startsWith('data:')) {
    console.log(`🖼️ Rendering base64 image for: ${alt}`)
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ 
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
    )
  }

  // Para outras URLs, usar Next.js Image
  return (
    <div className="relative w-full h-full">
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-600 to-purple-600">
          <div className="text-white text-2xl">⏳</div>
        </div>
      )}
      <Image
        src={src}
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