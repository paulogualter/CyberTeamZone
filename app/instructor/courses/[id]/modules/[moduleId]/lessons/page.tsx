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
  VideoCameraIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import { Lesson } from '@/types'
import toast from 'react-hot-toast'

export default function ModuleLessons() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const moduleId = params.moduleId as string
  
  const [module, setModule] = useState<any>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false)

  useEffect(() => {
    if (moduleId) {
      fetchModuleData()
      fetchLessons()
    }
  }, [moduleId])

  const fetchModuleData = async () => {
    try {
      const response = await fetch(`/api/instructor/modules/${moduleId}`)
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
      const response = await fetch(`/api/instructor/lessons?moduleId=${moduleId}`)
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
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return

    try {
      const response = await fetch(`/api/instructor/lessons/${lessonId}`, {
        method: 'DELETE'
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
                onClick={() => router.push(`/instructor/courses/${courseId}/modules`)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Aulas do Módulo</h1>
                <p className="text-gray-300">{module?.title || 'Carregando...'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateLessonModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Criar Aula
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {lessons.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma aula criada</h3>
            <p className="text-gray-400 mb-6">Comece criando a primeira aula do módulo</p>
            <button
              onClick={() => setShowCreateLessonModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Criar Primeira Aula
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {lesson.title}
                          </h3>
                          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                            {lesson.type === 'VIDEO' ? 'Vídeo' : 'Texto'}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          {lesson.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{lesson.duration}min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {lesson.type === 'VIDEO' ? (
                              <VideoCameraIcon className="h-4 w-4" />
                            ) : (
                              <DocumentIcon className="h-4 w-4" />
                            )}
                            <span>{lesson.type === 'VIDEO' ? 'Vídeo' : 'Conteúdo'}</span>
                          </div>
                          {lesson.isPublished && (
                            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                              Publicado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/edit`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => router.push(`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/preview`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <PlayIcon className="h-4 w-4" />
                        Visualizar
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
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
          onSuccess={() => {
            fetchLessons()
            setShowCreateLessonModal(false)
          }}
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
    duration: 0,
    type: 'VIDEO' as 'VIDEO' | 'TEXT',
    videoUrl: '',
    order: 1,
    isPublished: false
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const response = await fetch('/api/instructor/lessons', {
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
        <h3 className="text-lg font-semibold text-white mb-4">Criar Nova Aula</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título da Aula
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
                Duração (minutos)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Aula
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'VIDEO' | 'TEXT' })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="VIDEO">Vídeo</option>
              <option value="TEXT">Texto/Conteúdo</option>
            </select>
          </div>

          {formData.type === 'VIDEO' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL do Vídeo
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Breve descrição da aula"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Conteúdo da Aula
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Conteúdo detalhado da aula (pode incluir HTML)"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Publicar imediatamente</span>
            </label>
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
              {loading ? 'Criando...' : 'Criar Aula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
