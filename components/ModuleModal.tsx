'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Trash2, Eye, EyeOff } from 'lucide-react'

interface Module {
  id?: string
  title: string
  description: string
  order: number
  isPublished: boolean
  courseId: string
}

interface ModuleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (module: Module) => Promise<void>
  onDelete?: (moduleId: string) => Promise<void>
  module?: Module | null
  courseId: string
  nextOrder?: number
}

export default function ModuleModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  module,
  courseId,
  nextOrder = 1
}: ModuleModalProps) {
  const [formData, setFormData] = useState<Module>({
    title: '',
    description: '',
    order: nextOrder,
    isPublished: false,
    courseId
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when module changes
  useEffect(() => {
    if (module) {
      setFormData({
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.order,
        isPublished: module.isPublished,
        courseId: module.courseId
      })
    } else {
      setFormData({
        title: '',
        description: '',
        order: nextOrder,
        isPublished: false,
        courseId
      })
    }
    setError('')
  }, [module, courseId, nextOrder])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validação básica
      if (!formData.title.trim()) {
        throw new Error('O título do módulo é obrigatório')
      }

      await onSave(formData)
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar módulo'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!module?.id || !onDelete) return

    if (!confirm('Tem certeza que deseja excluir este módulo? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsLoading(true)
    try {
      await onDelete(module.id)
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir módulo'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {module ? 'Editar Módulo' : 'Novo Módulo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título do Módulo *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Digite o título do módulo"
                  required
                />
              </div>

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
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição do Módulo
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                placeholder="Descreva o conteúdo deste módulo"
              />
            </div>

            {/* Published Status */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-300">
                  Publicar módulo
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center space-x-4">
            {module && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors disabled:opacity-50"
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
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
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
