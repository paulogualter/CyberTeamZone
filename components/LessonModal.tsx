'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Trash2, Eye, EyeOff, Clock, Play } from 'lucide-react'
import VideoUpload from './VideoUpload'

interface Lesson {
  id?: string
  title: string
  content: string
  videoUrl?: string
  duration?: number
  order: number
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'PRACTICAL' | 'CTF'
  isPublished: boolean
  moduleId: string
}

interface LessonModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (lesson: Lesson) => Promise<void>
  onDelete?: (lessonId: string) => Promise<void>
  lesson?: Lesson | null
  moduleId: string
  nextOrder?: number
}

export default function LessonModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  lesson,
  moduleId,
  nextOrder = 1
}: LessonModalProps) {
  const [formData, setFormData] = useState<Lesson>({
    title: '',
    content: '',
    videoUrl: '',
    duration: 0,
    order: nextOrder,
    type: 'VIDEO',
    isPublished: false,
    moduleId
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Reset form when lesson changes
  useEffect(() => {
    if (lesson) {
      setFormData({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration || 0,
        order: lesson.order,
        type: lesson.type,
        isPublished: lesson.isPublished,
        moduleId: lesson.moduleId
      })
    } else {
      setFormData({
        title: '',
        content: '',
        videoUrl: '',
        duration: 0,
        order: nextOrder,
        type: 'VIDEO',
        isPublished: false,
        moduleId
      })
    }
    setError('')
  }, [lesson, moduleId, nextOrder])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }))
  }

  const handleVideoUploaded = (videoUrl: string, filename: string) => {
    setFormData(prev => ({
      ...prev,
      videoUrl
    }))
  }

  const handleVideoRemoved = () => {
    setFormData(prev => ({
      ...prev,
      videoUrl: ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validação básica
      if (!formData.title.trim()) {
        throw new Error('O título da aula é obrigatório')
      }

      if (!formData.content.trim()) {
        throw new Error('O conteúdo da aula é obrigatório')
      }

      await onSave(formData)
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar aula'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!lesson?.id || !onDelete) return

    if (!confirm('Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsLoading(true)
    try {
      await onDelete(lesson.id)
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir aula'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {lesson ? 'Editar Aula' : 'Nova Aula'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Aula *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o título da aula"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo da Aula
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="VIDEO">Vídeo</option>
                  <option value="TEXT">Texto</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="PRACTICAL">Prática</option>
                  <option value="CTF">CTF</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordem
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Publicar aula
                  </span>
                </label>
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vídeo da Aula
              </label>
              <VideoUpload
                onVideoUploaded={handleVideoUploaded}
                onVideoRemoved={handleVideoRemoved}
                initialVideoUrl={formData.videoUrl}
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Conteúdo da Aula *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showPreview ? 'Editar' : 'Visualizar'}</span>
                </button>
              </div>

              {showPreview ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px]">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                </div>
              ) : (
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o conteúdo da aula (suporte a HTML)"
                  required
                />
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-4">
            {lesson && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
