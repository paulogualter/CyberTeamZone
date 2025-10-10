'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  VideoCameraIcon,
  ClockIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Lesson } from '@/types'
import toast from 'react-hot-toast'

export default function AdminModuleLessons() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const moduleId = params.moduleId as string
  
  const [course, setCourse] = useState<any>(null)
  const [module, setModule] = useState<any>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false)

  useEffect(() => {
    if (courseId && moduleId) {
      fetchCourseData()
      fetchModuleData()
      fetchLessons()
    }
  }, [courseId, moduleId])

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

  const fetchModuleData = async () => {
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`)
      const data = await response.json()
      
      if (data.success) {
        setModule(data.module)
      }
    } catch (error) {
      console.error('Error fetching module:', error)
      toast.error('Erro ao carregar dados do módulo')
    }
  }

  const fetchLessons = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/lessons?moduleId=${moduleId}`)
      const data = await response.json()
      
      if (data.success) {
        setLessons(data.lessons || [])
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
      toast.error('Erro ao carregar aulas')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Aula excluída com sucesso!')
        fetchLessons()
      } else {
        toast.error(data.error || 'Erro ao excluir aula')
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error('Erro ao excluir aula')
    }
  }

  const handleLessonCreated = () => {
    setShowCreateLessonModal(false)
    fetchLessons()
  }

  if (!courseId || !moduleId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Parâmetros inválidos</h1>
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
                onClick={() => router.push(`/admin/courses/${courseId}/modules`)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Aulas - {module?.title || 'Carregando...'}
                </h1>
                <p className="text-gray-300">
                  {course?.title} • Módulo: {module?.title}
                  {course?.instructor && (
                    <span className="ml-2">
                      • Instrutor: {course.instructor.name}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowCreateLessonModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nova Aula</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-300 mt-4">Carregando aulas...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12">
            <VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhuma aula encontrada
            </h3>
            <p className="text-gray-400 mb-6">
              Este módulo ainda não possui aulas. Crie a primeira aula para começar.
            </p>
            <button 
              onClick={() => setShowCreateLessonModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Criar Primeira Aula</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <VideoCameraIcon className="h-6 w-6 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">
                          {lesson.title}
                        </h3>
                        <span className="px-2 py-1 bg-slate-700 text-gray-300 text-sm rounded">
                          #{lesson.order}
                        </span>
                        {lesson.isPublished ? (
                          <span className="px-2 py-1 bg-green-600 text-white text-sm rounded">
                            Publicado
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-600 text-white text-sm rounded">
                            Rascunho
                          </span>
                        )}
                      </div>
                      {lesson.description && (
                        <p className="text-gray-300 mb-4 text-sm">
                          {lesson.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{lesson.duration || 0} minutos</span>
                        </div>
                        {lesson.videoUrl && (
                          <div className="flex items-center space-x-1">
                            <PlayIcon className="h-4 w-4" />
                            <span>Vídeo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {/* TODO: Edit lesson */}}
                      className="flex items-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Lesson Modal */}
      {showCreateLessonModal && (
        <CreateLessonModal 
          moduleId={moduleId}
          onClose={() => setShowCreateLessonModal(false)}
          onSuccess={handleLessonCreated}
        />
      )}
    </div>
  )
}

// Create Lesson Modal Component
function CreateLessonModal({ 
  moduleId, 
  onClose, 
  onSuccess 
}: { 
  moduleId: string
  onClose: () => void
  onSuccess: () => void 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    duration: 0,
    order: 1,
    isPublished: false
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          moduleId
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Aula criada com sucesso!')
        onSuccess()
      } else {
        toast.error(data.error || 'Erro ao criar aula')
      }
    } catch (error) {
      console.error('Error creating lesson:', error)
      toast.error('Erro ao criar aula')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Criar Nova Aula</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título da Aula
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Introdução aos Conceitos Básicos"
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
              placeholder="Descreva o que será abordado nesta aula..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Conteúdo da Aula
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Conteúdo detalhado da aula (pode incluir HTML)..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL do Vídeo
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duração (minutos)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
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
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-300">
              Publicar aula imediatamente
            </label>
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
              {loading ? 'Criando...' : 'Criar Aula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
