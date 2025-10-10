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
  BookOpenIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Module, Lesson } from '@/types'
import toast from 'react-hot-toast'

export default function AdminModules() {
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
      const response = await fetch(`/api/admin/courses/${courseId}`)
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
      const response = await fetch(`/api/modules?courseId=${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        setModules(data.modules || [])
      } else {
        console.error('Error fetching modules:', data.error)
        toast.error(data.error || 'Erro ao carregar módulos')
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
      toast.error('Erro ao carregar módulos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo? Todas as aulas serão excluídas também.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'DELETE',
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

  const handleModuleCreated = () => {
    setShowCreateModuleModal(false)
    fetchModules()
  }

  if (!courseId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">ID do Curso não fornecido</h1>
          <button 
            onClick={() => router.push('/admin/courses')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Voltar para Cursos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Page Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/courses')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Módulos - {course?.title || 'Carregando...'}
                </h1>
                <p className="text-gray-300">
                  Gerenciar módulos e aulas do curso
                  {course?.instructor && (
                    <span className="ml-2">
                      • Instrutor: {course.instructor.name}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowCreateModuleModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Novo Módulo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-300 mt-4">Carregando módulos...</p>
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhum módulo encontrado
            </h3>
            <p className="text-gray-400 mb-6">
              Este curso ainda não possui módulos. Crie o primeiro módulo para começar.
            </p>
            <button 
              onClick={() => setShowCreateModuleModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Criar Primeiro Módulo</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <BookOpenIcon className="h-6 w-6 text-blue-400" />
                        <h3 className="text-xl font-semibold text-white">
                          {module.title}
                        </h3>
                        <span className="px-2 py-1 bg-slate-700 text-gray-300 text-sm rounded">
                          Ordem: {module.order}
                        </span>
                        {module.isPublished ? (
                          <span className="px-2 py-1 bg-green-600 text-white text-sm rounded">
                            Publicado
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-600 text-white text-sm rounded">
                            Rascunho
                          </span>
                        )}
                      </div>
                      {module.description && (
                        <p className="text-gray-300 mb-4">{module.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/admin/courses/${courseId}/modules/${module.id}/lessons`)}
                        className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Gerenciar Aulas
                      </button>
                      <button
                        onClick={() => {/* TODO: Edit module */}}
                        className="flex items-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm transition-colors"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </div>

                  {/* Lessons Preview */}
                  {module.lessons && module.lessons.length > 0 && (
                    <div className="border-t border-slate-700 pt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">
                        Aulas ({module.lessons.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {module.lessons.slice(0, 3).map((lesson: any) => (
                          <div key={lesson.id} className="bg-slate-700 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <PlayIcon className="h-4 w-4 text-blue-400" />
                              <span className="text-sm font-medium text-white">
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="h-3 w-3" />
                                <span>{lesson.duration || 0}min</span>
                              </div>
                              <span className={`px-2 py-1 rounded ${
                                lesson.isPublished ? 'bg-green-600' : 'bg-yellow-600'
                              } text-white`}>
                                {lesson.isPublished ? 'Publicado' : 'Rascunho'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {module.lessons.length > 3 && (
                          <div className="bg-slate-700 rounded-lg p-3 flex items-center justify-center">
                            <span className="text-sm text-gray-400">
                              +{module.lessons.length - 3} mais aulas
                            </span>
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
          onSuccess={handleModuleCreated}
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
      const response = await fetch('/api/modules', {
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
        <h2 className="text-xl font-bold text-white mb-4">Criar Novo Módulo</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título do Módulo
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descreva o que será abordado neste módulo..."
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
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Módulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}