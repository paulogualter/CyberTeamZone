'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline'

interface VideoPlayerProps {
  src: string
  title: string
  lessonId?: string
  onProgress?: (progress: number) => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onLessonCompleted?: (lessonId: string) => void
}

export default function VideoPlayer({ src, title, lessonId, onProgress, onTimeUpdate, onLessonCompleted }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isYouTube, setIsYouTube] = useState(false)
  const [isPandaVideo, setIsPandaVideo] = useState(false)
  const [youtubeVideoId, setYoutubeVideoId] = useState('')
  const [pandaVideoId, setPandaVideoId] = useState('')
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0)

  // Função para extrair ID do vídeo do YouTube
  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Função para extrair ID do vídeo do Panda Video
  const extractPandaVideoId = (url: string) => {
    const regExp = /pandavideo\.com\/(?:embed\/)?([a-zA-Z0-9_-]+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  // Função para atualizar progresso na API
  const updateProgress = async (currentTime: number, videoDuration: number) => {
    if (!lessonId || isYouTube || isPandaVideo) return

    // Atualizar a cada 5 segundos para não sobrecarregar a API
    if (currentTime - lastProgressUpdate < 5) return

    try {
      const response = await fetch('/api/user/course-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          watchedTime: currentTime,
          videoDuration: videoDuration,
          completed: false
        }),
      })

      const data = await response.json()
      
      if (data.success && data.autoCompleted) {
        onLessonCompleted?.(lessonId)
      }
      
      setLastProgressUpdate(currentTime)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  // Detectar tipo de vídeo e extrair ID
  useEffect(() => {
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      const videoId = extractYouTubeId(src)
      if (videoId) {
        setIsYouTube(true)
        setIsPandaVideo(false)
        setYoutubeVideoId(videoId)
        setPandaVideoId('')
      } else {
        setIsYouTube(false)
        setIsPandaVideo(false)
        setYoutubeVideoId('')
        setPandaVideoId('')
      }
    } else if (src.includes('pandavideo.com')) {
      const videoId = extractPandaVideoId(src)
      if (videoId) {
        setIsYouTube(false)
        setIsPandaVideo(true)
        setYoutubeVideoId('')
        setPandaVideoId(videoId)
      } else {
        setIsYouTube(false)
        setIsPandaVideo(false)
        setYoutubeVideoId('')
        setPandaVideoId('')
      }
    } else {
      setIsYouTube(false)
      setIsPandaVideo(false)
      setYoutubeVideoId('')
      setPandaVideoId('')
    }
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video || isYouTube || isPandaVideo) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      const current = video.currentTime
      const total = video.duration
      setCurrentTime(current)
      setProgress((current / total) * 100)
      onTimeUpdate?.(current, total)
      
      // Atualizar progresso na API
      updateProgress(current, total)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [onTimeUpdate])

  useEffect(() => {
    onProgress?.(progress)
  }, [progress, onProgress])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    video.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const seekTime = (parseFloat(e.target.value) / 100) * duration
    video.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className="relative bg-gradient-to-br from-slate-900 to-slate-800 group w-full h-full"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isYouTube ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&controls=1&modestbranding=1&rel=0&fs=1&cc_load_policy=1&iv_load_policy=3&showinfo=0`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title}
          loading="lazy"
        />
      ) : isPandaVideo ? (
        <iframe
          src={`https://pandavideo.com/embed/${pandaVideoId}`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title}
          loading="lazy"
        />
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster="/images/video-poster.jpg"
          onClick={togglePlayPause}
          controls={false}
        >
          <source src={src} type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
      )}

      {/* Play/Pause Overlay - Only for non-YouTube and non-Panda videos */}
      {!isYouTube && !isPandaVideo && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            className="w-20 h-20 bg-blue-500/80 hover:bg-blue-500 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <PlayIcon className="h-8 w-8 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Controls Overlay - Only for non-YouTube and non-Panda videos */}
      {!isYouTube && !isPandaVideo && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
            }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5 text-white" />
              ) : (
                <PlayIcon className="h-5 w-5 text-white" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="h-5 w-5 text-white" />
              ) : (
                <SpeakerWaveIcon className="h-5 w-5 text-white" />
              )}
            </button>

            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="h-5 w-5 text-white" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5 text-white" />
              )}
            </button>

            <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <Cog6ToothIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  )
}
