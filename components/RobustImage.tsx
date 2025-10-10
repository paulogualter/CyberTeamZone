'use client'

import Image from 'next/image'
import { useState } from 'react'

interface RobustImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
  style?: React.CSSProperties
}

const RobustImage: React.FC<RobustImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  style
}) => {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      console.log(`🔄 Image failed to load: ${src}, trying fallback`)
      setHasError(true)
      
      // Se a imagem original falhou, tentar a API de fallback
      if (src.startsWith('/uploads/')) {
        const filename = src.split('/').pop()
        setImageSrc(`/api/uploads/${filename}`)
      } else {
        // Se ainda falhar, usar placeholder
        setImageSrc('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+SW1hZ2Ugbm90IGZvdW5kPC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNjUlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiPkZhbGxiYWNrIGltYWdlPC90ZXh0Pgo8L3N2Zz4=')
      }
    }
  }

  if (!src) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-800 text-gray-400 rounded-md ${className}`}
        style={{ width, height, ...style }}
      >
        No Image
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height, ...style }}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className="object-cover rounded-md"
        onError={handleError}
        priority={priority}
        sizes={sizes}
        style={style}
      />
    </div>
  )
}

export default RobustImage
