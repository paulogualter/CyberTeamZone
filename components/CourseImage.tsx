import Image from 'next/image'
import { useState } from 'react'

interface CourseImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackIcon?: string
}

export default function CourseImage({ 
  src, 
  alt, 
  className = "w-full h-full object-cover",
  fallbackIcon = "🛡️"
}: CourseImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Debug log
  console.log('CourseImage render:', { src, imageError, imageLoading })

  if (!src || imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600`}>
        <div className="text-white text-6xl">{fallbackIcon}</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {imageLoading && (
        <div className={`absolute inset-0 ${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600`}>
          <div className="text-white text-2xl">⏳</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={(e) => {
          console.log('Image load error for:', src, e)
          setImageError(true)
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', src)
          setImageLoading(false)
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
        unoptimized={true}
      />
    </div>
  )
}
