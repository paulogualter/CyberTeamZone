'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Play, Eye, EyeOff, Clock, BookOpen } from 'lucide-react'
import ModuleModal from './ModuleModal'

interface Module {
  id?: string
  title: string
  description: string
  order: number
  isPublished: boolean
  courseId: string
  lessons?: Lesson[]
  createdAt?: string
  updatedAt?: string
}

interface Lesson {
  id: string
  title: string
  order: number
  duration?: number
  isPublished: boolean
}

interface ModuleListProps {
  courseId: string
  courseTitle?: string
}

export default function ModuleList({ courseId, courseTitle }: ModuleListProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)

  const fetchModules = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/test-auth?courseId=${courseId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch modules')
      }
      const data = await response.json()
      setModules(data.modules)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (courseId) {
      fetchModules()
    }
  }, [courseId])

  const createModule = async (moduleData: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/instructor/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create module')
      }
      const data = await response.json()
      setModules(prev => [...prev, data.module].sort((a, b) => a.order - b.order))
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const updateModule = async (moduleId: string, updatedFields: Partial<Module>) => {
    try {
      const response = await fetch(`/api/instructor/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update module')
      }
      const data = await response.json()
      setModules(prev => prev.map(m => (m.id === moduleId ? data.module : m)).sort((a, b) => a.order - b.order))
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const deleteModule = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/instructor/modules/${moduleId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete module')
      }
      setModules(prev => prev.filter(m => m.id !== moduleId))
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const handleCreateModule = async (moduleData: Module) => {
    try {
      const { id, createdAt, updatedAt, ...createData } = moduleData
      await createModule(createData)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar módulo:', error)
      throw error
    }
  }

  const handleUpdateModule = async (moduleData: Module) => {
    try {
      if (!moduleData.id) throw new Error('Module ID is required')
      const { id, createdAt, updatedAt, ...updateData } = moduleData
      await updateModule(id, updateData)
      setIsModalOpen(false)
      setEditingModule(null)
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error)
      throw error
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await deleteModule(moduleId)
    } catch (error) {
      console.error('Erro ao excluir módulo:', error)
      throw error
    }
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingModule(null)
  }

  const nextOrder = modules.length > 0 ? Math.max(...modules.map(m => m.order)) + 1 : 1

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-300">Carregando módulos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
        <p className="font-medium">Erro ao carregar módulos</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {courseTitle ? `Módulos - ${courseTitle}` : 'Módulos do Curso'}
          </h2>
          <p className="text-gray-300 mt-1">
            {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'} cadastrado{modules.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Módulo</span>
        </button>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-white">Nenhum módulo cadastrado</h3>
          <p className="mt-1 text-sm text-gray-300">
            Comece criando o primeiro módulo deste curso.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Módulo
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {modules
            .sort((a, b) => a.order - b.order)
            .map((module) => (
              <div
                key={module.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:shadow-lg hover:border-slate-600 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Order Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {module.order}
                      </div>
                    </div>

                    {/* Module Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-white truncate">
                          {module.title}
                        </h3>
                        {module.isPublished ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                            <Eye className="h-3 w-3 mr-1" />
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-600 text-white">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Rascunho
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        {module.lessons && (
                          <div className="flex items-center space-x-1">
                            <Play className="h-4 w-4" />
                            <span>{module.lessons.length} aulas</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <span>Criado em {module.createdAt ? new Date(module.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</span>
                        </div>
                      </div>

                      {module.description && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {module.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditModule(module)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                      title="Editar módulo"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id!)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                      title="Excluir módulo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal */}
      <ModuleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingModule ? handleUpdateModule : handleCreateModule}
        onDelete={handleDeleteModule}
        module={editingModule}
        courseId={courseId}
        nextOrder={nextOrder}
      />
    </div>
  )
}
