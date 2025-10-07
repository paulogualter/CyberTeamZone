'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowLeftIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { Module, Lesson } from '@/types'
import toast from 'react-hot-toast'

export default function CourseModules() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false)

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
      fetchModules()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/instructor/courses/${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        setCourse(data.course)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      toast.error('Erro ao carregar dados do curso')
    }
  }

  const fetchModules = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/modules?courseId=${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        setModules(data.modules || [])
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
      toast.error('Erro ao carregar módulos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo?')) return

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Módulo excluído com sucesso!')
        fetchModules()
      } else {
        toast.error(data.error || 'Erro ao excluir módulo')
      }
    } catch (error) {
      console.error('Error deleting module:', error)
      toast.error('Erro ao excluir módulo')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Page Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Módulos do Curso</h1>
                <p className="text-gray-300">{course?.title || 'Carregando...'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModuleModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Criar Módulo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {modules.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhum módulo criado</h3>
            <p className="text-gray-400 mb-6">Comece criando o primeiro módulo do curso</p>
            <button
              onClick={() => setShowCreateModuleModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Criar Primeiro Módulo
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                          Módulo {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-white">
                          {module.title}
                        </h3>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        {module.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <DocumentTextIcon className="h-4 w-4" />
                          <span>{module.lessons?.length || 0} aulas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{module.lessons?.reduce((total, lesson) => total + (lesson.duration || 0), 0) || 0}min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/instructor/courses/${courseId}/modules/${module.id}/lessons`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <PlayIcon className="h-4 w-4" />
                        Gerenciar Aulas
                      </button>
                      <button
                        onClick={() => router.push(`/instructor/courses/${courseId}/modules/${module.id}/edit`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
                  </div>

                  {/* Lessons Preview */}
                  {module.lessons && module.lessons.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Aulas do Módulo:</h4>
                      <div className="space-y-2">
                        {module.lessons.slice(0, 3).map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs">
                              {lessonIndex + 1}
                            </span>
                            <span className="flex-1">{lesson.title}</span>
                            <span className="text-xs">{lesson.duration}min</span>
                          </div>
                        ))}
                        {module.lessons.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{module.lessons.length - 3} aulas adicionais
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Module Modal */}
      {showCreateModuleModal && (
        <CreateModuleModal
          courseId={courseId}
          onClose={() => setShowCreateModuleModal(false)}
          onSuccess={() => {
            fetchModules()
            setShowCreateModuleModal(false)
          }}
        />
      )}
    </div>
  )
}

// Create Module Modal Component
function CreateModuleModal({ 
  courseId, 
  onClose, 
  onSuccess 
}: { 
  courseId: string
  onClose: () => void
  onSuccess: () => void 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
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
        toast.success('Módulo criado com sucesso!')
        onSuccess()
      } else {
        toast.error(data.error || 'Erro ao criar módulo')
      }
    } catch (error) {
      console.error('Error creating module:', error)
      toast.error('Erro ao criar módulo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">Criar Novo Módulo</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título do Módulo
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Introdução à Cibersegurança"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o que será abordado neste módulo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ordem
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Módulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
