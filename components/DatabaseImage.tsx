import Image from 'next/image'
import { useState } from 'react'

interface DatabaseImageProps {
  imageId: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
}

export default function DatabaseImage({ 
  imageId, 
  alt, 
  width = 300, 
  height = 200, 
  className = '',
  fallbackSrc = '/images/shield-icon.png'
}: DatabaseImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const imageUrl = `/api/images/${imageId}`

  const handleError = () => {
    console.log('❌ Error loading database image:', imageId)
    setImageError(true)
    setImageLoading(false)
  }

  const handleLoad = () => {
    console.log('✅ Database image loaded successfully:', imageId)
    setImageLoading(false)
  }

  if (imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <Image
          src={fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          className="opacity-50"
        />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400">Carregando...</div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoad}
        className={`transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ width, height }}
      />
    </div>
  )
}
