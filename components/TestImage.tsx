'use client'

import React, { useState, useEffect } from 'react'

interface TestImageProps {
  src: string | null | undefined
  alt: string
  className?: string
}

const TestImage: React.FC<TestImageProps> = ({ 
  src, 
  alt, 
  className = "w-full h-full object-cover"
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    setImageLoading(true)
    setImageError(false)
  }, [src])

  const handleImageError = () => {
    console.log(`❌ TestImage: Failed to load image for: ${alt}`)
    console.log(`❌ TestImage: Source type: ${src?.startsWith('data:') ? 'BASE64' : 'OTHER'}`)
    console.log(`❌ TestImage: Source length: ${src?.length || 0}`)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    console.log(`✅ TestImage: Successfully loaded image for: ${alt}`)
    setImageLoading(false)
  }

  if (!src || imageError) {
    return (
      <div className={`${className} bg-red-500 flex items-center justify-center`}>
        <span className="text-white text-sm">❌ Image Error</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {imageLoading && (
        <div className={`absolute inset-0 ${className} flex items-center justify-center bg-blue-500`}>
          <span className="text-white text-sm">⏳ Loading...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}

export default TestImage
