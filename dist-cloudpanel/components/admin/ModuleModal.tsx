'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Module } from '@/types'
import toast from 'react-hot-toast'

interface ModuleModalProps {
  module?: Module | null
  courseId: string
  onClose: () => void
  onSuccess: () => void
}

export default function ModuleModal({ module, courseId, onClose, onSuccess }: ModuleModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    isPublished: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title,
        description: module.description || '',
        order: module.order,
        isPublished: module.isPublished
      })
    } else {
      // Get next order number for new module
      fetchNextOrder()
    }
  }, [module])

  const fetchNextOrder = async () => {
    try {
      const response = await fetch(`/api/admin/modules?courseId=${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        const nextOrder = data.modules.length > 0 
          ? Math.max(...data.modules.map((m: Module) => m.order)) + 1 
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

    setLoading(true)

    try {
      const url = module 
        ? `/api/admin/modules/${module.id}`
        : '/api/admin/modules'
      
      const method = module ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          courseId
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(module ? 'Módulo atualizado com sucesso!' : 'Módulo criado com sucesso!')
        onSuccess()
      } else {
        toast.error(data.error || 'Erro ao salvar módulo')
      }
    } catch (error) {
      console.error('Error saving module:', error)
      toast.error('Erro ao salvar módulo')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {module ? 'Editar Módulo' : 'Novo Módulo'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título do Módulo *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Introdução à Cibersegurança"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o que será abordado neste módulo..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  Publicar módulo
                </label>
              </div>
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
                <span>{loading ? 'Salvando...' : (module ? 'Atualizar' : 'Criar')}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
