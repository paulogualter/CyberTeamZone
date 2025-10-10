import { useState } from 'react'

interface SimpleCourseImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackIcon?: string
}

export default function SimpleCourseImage({ 
  src, 
  alt, 
  className = "w-full h-full object-cover",
  fallbackIcon = "🛡️"
}: SimpleCourseImageProps) {
  const [imageError, setImageError] = useState(false)

  // Debug log
  console.log('SimpleCourseImage render:', { src, imageError })

  if (!src || imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600`}>
        <div className="text-white text-6xl">{fallbackIcon}</div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        console.log('Image load error for:', src, e)
        setImageError(true)
      }}
      onLoad={() => {
        console.log('Image loaded successfully:', src)
      }}
    />
  )
}
