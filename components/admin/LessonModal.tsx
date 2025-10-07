'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Lesson, Module } from '@/types'
import toast from 'react-hot-toast'

interface LessonModalProps {
  lesson?: Lesson | null
  module: Module | null
  onClose: () => void
  onSuccess: () => void
}

const lessonTypes = [
  { value: 'VIDEO', label: 'Vídeo', description: 'Aula em vídeo' },
  { value: 'TEXT', label: 'Texto', description: 'Conteúdo em texto' },
  { value: 'QUIZ', label: 'Quiz', description: 'Questionário interativo' },
  { value: 'PRACTICAL', label: 'Prática', description: 'Exercício prático' },
  { value: 'CTF', label: 'CTF', description: 'Capture The Flag' }
]

export default function LessonModal({ lesson, module, onClose, onSuccess }: LessonModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'VIDEO' as 'VIDEO' | 'TEXT' | 'QUIZ' | 'PRACTICAL' | 'CTF',
    order: 1,
    isPublished: false,
    videoUrl: '',
    attachment: null as File | null
  })
  const [loading, setLoading] = useState(false)
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoType, setVideoType] = useState<'youtube' | 'pandavideo' | 'upload'>('youtube')
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [existingVideo, setExistingVideo] = useState<string | null>(null)

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        content: lesson.content,
        type: lesson.type,
        order: lesson.order,
        isPublished: lesson.isPublished,
        videoUrl: lesson.videoUrl || '',
        attachment: null
      })
      setExistingAttachment(lesson.attachment || null)
      
      // Detectar tipo de vídeo baseado na URL
      if (lesson.videoUrl) {
        if (lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be')) {
          setVideoType('youtube')
          setExistingVideo(lesson.videoUrl)
        } else if (lesson.videoUrl.includes('pandavideo')) {
          setVideoType('pandavideo')
          setExistingVideo(lesson.videoUrl)
        } else if (lesson.videoUrl.startsWith('/uploads/')) {
          setVideoType('upload')
          setExistingVideo(lesson.videoUrl)
        }
      }
    } else if (module) {
      // Get next order number for new lesson
      fetchNextOrder()
      setExistingAttachment(null)
      setExistingVideo(null)
    }
  }, [lesson, module])

  const fetchNextOrder = async () => {
    if (!module) return

    try {
      const response = await fetch(`/api/admin/lessons?moduleId=${module.id}`)
      const data = await response.json()
      
      if (data.success) {
        const nextOrder = data.lessons.length > 0 
          ? Math.max(...data.lessons.map((l: Lesson) => l.order)) + 1 
          : 1
        setFormData(prev => ({ ...prev, order: nextOrder }))
      }
    } catch (error) {
      console.error('Error fetching next order:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Conteúdo é obrigatório')
      return
    }

    if (!module) {
      toast.error('Módulo não selecionado')
      return
    }

    setLoading(true)

    try {
      let attachmentUrl = existingAttachment
      let videoUrl = formData.videoUrl
      
      // Upload new file if provided
      if (selectedFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', selectedFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload
        })
        
        const uploadData = await uploadResponse.json()
        if (uploadData.success) {
          attachmentUrl = uploadData.fileUrl
        } else {
          toast.error('Erro ao fazer upload do arquivo')
          setLoading(false)
          return
        }
      }

      // Upload video if new video file selected
      if (selectedVideoFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', selectedVideoFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload
        })
        
        const uploadData = await uploadResponse.json()
        if (uploadData.success) {
          videoUrl = uploadData.fileUrl
        } else {
          toast.error('Erro ao fazer upload do vídeo')
          setLoading(false)
          return
        }
      } else if (videoType === 'upload' && existingVideo) {
        videoUrl = existingVideo
      }

      const url = lesson 
        ? `/api/admin/lessons/${lesson.id}`
        : '/api/admin/lessons'
      
      const method = lesson ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          videoUrl: videoUrl,
          attachment: attachmentUrl,
          moduleId: module.id
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(lesson ? 'Aula atualizada com sucesso!' : 'Aula criada com sucesso!')
        onSuccess()
      } else {
        toast.error(data.error || 'Erro ao salvar aula')
      }
    } catch (error) {
      console.error('Error saving lesson:', error)
      toast.error('Erro ao salvar aula')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setExistingAttachment(null) // Clear existing attachment when new file is selected
    }
  }

  const handleRemoveAttachment = () => {
    setExistingAttachment(null)
    setSelectedFile(null)
  }

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedVideoFile(file)
      setExistingVideo(null)
    }
  }

  const handleRemoveVideo = () => {
    setExistingVideo(null)
    setSelectedVideoFile(null)
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {lesson ? 'Editar Aula' : 'Nova Aula'}
              </h2>
              {module && (
                <p className="text-gray-400 text-sm mt-1">
                  Módulo: {module.title}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título da Aula *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Introdução aos Conceitos Básicos"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Aula *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {lessonTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Conteúdo da Aula *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o conteúdo da aula, objetivos de aprendizagem, exercícios, etc..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ordem
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-8">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-300">
                  Publicar aula
                </label>
              </div>
            </div>

            {formData.type === 'VIDEO' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mídia do Vídeo
                </label>
                
                {/* Tipo de Mídia */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="videoType"
                        value="youtube"
                        checked={videoType === 'youtube'}
                        onChange={(e) => setVideoType(e.target.value as 'youtube' | 'pandavideo' | 'upload')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-300">YouTube</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="videoType"
                        value="pandavideo"
                        checked={videoType === 'pandavideo'}
                        onChange={(e) => setVideoType(e.target.value as 'youtube' | 'pandavideo' | 'upload')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-300">Panda Video</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="videoType"
                        value="upload"
                        checked={videoType === 'upload'}
                        onChange={(e) => setVideoType(e.target.value as 'youtube' | 'pandavideo' | 'upload')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-300">Upload</span>
                    </label>
                  </div>
                </div>

                {/* Campo de URL para YouTube e Panda Video */}
                {(videoType === 'youtube' || videoType === 'pandavideo') && (
                  <div>
                    <input
                      type="url"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={videoType === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://pandavideo.com/...'}
                    />
                    
                    {/* Existing Video Display */}
                    {existingVideo && !selectedVideoFile && (
                      <div className="mt-2 p-3 bg-slate-700 border border-slate-600 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">
                                {videoType === 'youtube' ? 'YouTube Video' : 'Panda Video'}
                              </p>
                              <p className="text-gray-400 text-xs truncate max-w-xs">
                                {existingVideo}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Remover vídeo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload de Arquivo de Vídeo */}
                {videoType === 'upload' && (
                  <div>
                    {/* Existing Video File */}
                    {existingVideo && !selectedVideoFile && (
                      <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">
                                {existingVideo.split('/').pop()}
                              </p>
                              <p className="text-gray-400 text-xs">
                                Arquivo de vídeo carregado
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Remover vídeo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* File Upload */}
                    <input
                      type="file"
                      onChange={handleVideoFileSelect}
                      accept="video/*"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />

                    {/* New Video File Selected */}
                    {selectedVideoFile && (
                      <div className="mt-2 p-3 bg-green-700/20 border border-green-600/30 rounded-lg">
                        <p className="text-green-400 text-sm">
                          Novo vídeo selecionado: {selectedVideoFile.name}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Anexo
              </label>
              
              {/* Existing Attachment */}
              {existingAttachment && !selectedFile && (
                <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {existingAttachment.split('/').pop()}
                        </p>
                        <a
                          href={existingAttachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          Ver arquivo
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remover anexo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* File Upload */}
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {/* New File Selected */}
              {selectedFile && (
                <div className="mt-2 p-3 bg-green-700/20 border border-green-600/30 rounded-lg">
                  <p className="text-green-400 text-sm">
                    Novo arquivo selecionado: {selectedFile.name}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{loading ? 'Salvando...' : (lesson ? 'Atualizar' : 'Criar')}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
