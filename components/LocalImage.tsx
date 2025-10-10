'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface LocalImageProps extends React.ComponentProps<typeof Image> {
  filename: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

const LocalImage: React.FC<LocalImageProps> = ({ filename, alt, width, height, className, priority, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState<string>(`/api/uploads/${filename}`)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setCurrentSrc(`/api/uploads/${filename}`)
  }, [filename])

  const handleImageError = () => {
    console.log(`⚠️ Failed to load local image: ${filename}`)
    setError(true)
    setLoading(false)
  }

  const handleImageLoad = () => {
    setLoading(false)
  }

  if (error) {
    const fallbackSvg = encodeURIComponent(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#374151"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">
          Image Not Found
        </text>
        <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">
          ${filename}
        </text>
      </svg>
    `)
    return (
      <Image
        src={`data:image/svg+xml;utf8,${fallbackSvg}`}
        alt={`Fallback for ${alt}`}
        width={width}
        height={height}
        className={className}
        priority={priority}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <p className="text-white text-sm">Loading...</p>
        </div>
      )}
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={priority}
        style={{ objectFit: 'cover' }}
      />
    </>
  )
}

export default LocalImage
