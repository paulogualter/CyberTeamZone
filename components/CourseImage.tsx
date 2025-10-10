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

  if (!src || imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600`}>
        <div className="text-white text-6xl">{fallbackIcon}</div>
      </div>
    )
  }

  return (
    <div className="relative">
      {imageLoading && (
        <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600`}>
          <div className="text-white text-2xl">⏳</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => {
          console.log('Image load error for:', src)
          setImageError(true)
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', src)
          setImageLoading(false)
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
      />
    </div>
  )
}
