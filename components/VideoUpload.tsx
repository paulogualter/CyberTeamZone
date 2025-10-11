'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface VideoUploadProps {
  onVideoUploaded: (videoUrl: string, filename: string) => void
  onVideoRemoved: () => void
  initialVideoUrl?: string
  className?: string
}

export default function VideoUpload({ 
  onVideoUploaded, 
  onVideoRemoved, 
  initialVideoUrl,
  className = '' 
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || '')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [error, setError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    setError('')
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido')
      return
    }

    // Validar tamanho (máximo 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      setError('O arquivo de vídeo é muito grande. Tamanho máximo: 500MB')
      return
    }

    setVideoFile(file)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', file)

      const response = await fetch('/api/test/upload-video', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer upload do vídeo')
      }

      if (result.success) {
        setVideoUrl(result.videoUrl)
        onVideoUploaded(result.videoUrl, result.filename)
        setUploadProgress(100)
      } else {
        throw new Error(result.error || 'Erro ao fazer upload do vídeo')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro no upload:', err)
    } finally {
      setIsUploading(false)
    }
  }, [onVideoUploaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleRemoveVideo = useCallback(() => {
    setVideoUrl('')
    setVideoFile(null)
    onVideoRemoved()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onVideoRemoved])

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {!videoUrl && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isUploading ? 'border-blue-400 bg-blue-900/20' : 'border-slate-600 hover:border-slate-500'}
            ${error ? 'border-red-400 bg-red-900/20' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            
            <div>
              <p className="text-lg font-medium text-white">
                {isUploading ? 'Fazendo upload do vídeo...' : 'Arraste um vídeo aqui ou clique para selecionar'}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                Formatos suportados: MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV
              </p>
              <p className="text-sm text-gray-300">
                Tamanho máximo: 500MB
              </p>
            </div>

            {!isUploading && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Selecionar Vídeo
              </button>
            )}

            {isUploading && (
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {error && (
              <div className="text-red-300 text-sm bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Preview */}
      {videoUrl && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-auto max-h-96"
              controls={false}
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Custom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={togglePlayPause}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                </div>

                <button
                  onClick={handleRemoveVideo}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Info */}
          {videoFile && (
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{videoFile.name}</p>
                  <p className="text-sm text-gray-300">
                    {formatFileSize(videoFile.size)} • {videoFile.type}
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Trocar Vídeo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Input Alternative */}
      <div className="border-t border-slate-600 pt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Ou insira uma URL de vídeo (YouTube, Vimeo, etc.)
        </label>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
          onChange={(e) => {
            const url = e.target.value
            if (url) {
              setVideoUrl(url)
              onVideoUploaded(url, 'external-video')
            }
          }}
        />
      </div>
    </div>
  )
}
