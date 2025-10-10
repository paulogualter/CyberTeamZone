import { useState } from 'react'

interface DebugCourseImageProps {
  src: string | null | undefined
  alt: string
  className?: string
}

export default function DebugCourseImage({ 
  src, 
  alt, 
  className = "w-full h-full object-cover"
}: DebugCourseImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  console.log('DebugCourseImage render:', { 
    src, 
    imageError, 
    imageLoaded,
    hasSrc: !!src,
    srcType: typeof src
  })

  if (!src) {
    console.log('No src provided, showing fallback')
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600`}>
        <div className="text-white text-6xl">🛡️</div>
      </div>
    )
  }

  if (imageError) {
    console.log('Image error, showing fallback')
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-red-600 to-purple-600`}>
        <div className="text-white text-6xl">❌</div>
      </div>
    )
  }

  return (
    <div className="relative">
      {!imageLoaded && (
        <div className={`${className} flex items-center justify-center bg-gradient-to-br from-yellow-600 to-purple-600`}>
          <div className="text-white text-2xl">⏳</div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onError={(e) => {
          console.error('Image load error:', src, e)
          setImageError(true)
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', src)
          setImageLoaded(true)
        }}
      />
    </div>
  )
}
