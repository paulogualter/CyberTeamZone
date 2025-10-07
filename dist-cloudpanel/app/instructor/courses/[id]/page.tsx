'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  WrenchScrewdriverIcon,
  FlagIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Course, Module, Lesson } from '@/types'
import toast from 'react-hot-toast'

export default function InstructorCourseManagement() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)

  useEffect(() => {
    if (!session || (session.user as any)?.role !== 'INSTRUCTOR') {
      router.push('/instructor')
      return
    }

    fetchCourse()
  }, [params.id, session, router])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/instructor/courses/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setCourse(data.course)
      } else {
        toast.error(data.error || 'Erro ao carregar curso')
        router.push('/instructor')
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      toast.error('Erro ao carregar curso')
      router.push('/instructor')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo? Todas as aulas serão excluídas.')) return

    try {
      const response = await fetch(`/api/instructor/modules/${moduleId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Módulo excluído com sucesso!')
        fetchCourse()
      } else {
        toast.error(data.error || 'Erro ao excluir módulo')
      }
    } catch (error) {
      console.error('Error deleting module:', error)
      toast.error('Erro ao excluir módulo')
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
        fetchCourse()
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

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Curso não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/instructor')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{course.title}</h1>
                <p className="text-gray-300">Gerenciar curso e conteúdo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowModuleModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Novo Módulo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Info */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Duração</p>
                <p className="text-xl font-bold text-white">{course.duration}h</p>
              </div>
            </div>

            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Alunos</p>
                <p className="text-xl font-bold text-white">{course.enrolledCount || 0}</p>
              </div>
            </div>

            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Avaliação</p>
                <p className="text-xl font-bold text-white">{course.rating || 0}</p>
              </div>
            </div>

            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Aulas</p>
                <p className="text-xl font-bold text-white">
                  {course.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-6">
          {course.modules?.map((module, moduleIndex) => (
            <div key={module.id} className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{moduleIndex + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                    <p className="text-gray-300 text-sm">{module.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingModule(module)
                      setShowModuleModal(true)
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Editar módulo"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Excluir módulo"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Lessons */}
              <div className="space-y-3">
                {module.lessons?.map((lesson, lessonIndex) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-slate-600 rounded-full w-6 h-6 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{lessonIndex + 1}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getLessonIcon(lesson.type)}
                        <div>
                          <h4 className="text-white font-medium">{lesson.title}</h4>
                          <p className="text-gray-400 text-sm">
                            {lesson.type} • {lesson.duration || 0}min
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingLesson(lesson)
                          setSelectedModule(module)
                          setShowLessonModal(true)
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Editar aula"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Excluir aula"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={() => {
                    setSelectedModule(module)
                    setEditingLesson(null)
                    setShowLessonModal(true)
                  }}
                  className="w-full bg-slate-700 hover:bg-slate-600 border-2 border-dashed border-slate-500 rounded-lg p-4 flex items-center justify-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Adicionar Aula</span>
                </button>
              </div>
            </div>
          ))}

          {(!course.modules || course.modules.length === 0) && (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Nenhum módulo criado ainda
              </h3>
              <p className="text-gray-400 mb-6">
                Comece criando o primeiro módulo do seu curso
              </p>
              <button
                onClick={() => setShowModuleModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Criar Primeiro Módulo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <ModuleModal
          courseId={course.id}
          module={editingModule}
          onClose={() => {
            setShowModuleModal(false)
            setEditingModule(null)
          }}
          onSuccess={() => {
            fetchCourse()
            setShowModuleModal(false)
            setEditingModule(null)
          }}
        />
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <LessonModal
          moduleId={selectedModule?.id || ''}
          lesson={editingLesson}
          onClose={() => {
            setShowLessonModal(false)
            setEditingLesson(null)
            setSelectedModule(null)
          }}
          onSuccess={() => {
            fetchCourse()
            setShowLessonModal(false)
            setEditingLesson(null)
            setSelectedModule(null)
          }}
        />
      )}
    </div>
  )
}

function getLessonIcon(type: string) {
  switch (type) {
    case 'VIDEO':
      return <PlayIcon className="h-5 w-5 text-red-400" />
    case 'TEXT':
      return <DocumentTextIcon className="h-5 w-5 text-blue-400" />
    case 'QUIZ':
      return <PuzzlePieceIcon className="h-5 w-5 text-green-400" />
    case 'PRACTICAL':
      return <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-400" />
    case 'CTF':
      return <FlagIcon className="h-5 w-5 text-purple-400" />
    default:
      return <DocumentTextIcon className="h-5 w-5 text-gray-400" />
  }
}

// Module Modal Component
function ModuleModal({ 
  courseId, 
  module, 
  onClose, 
  onSuccess 
}: { 
  courseId: string
  module: Module | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title,
        description: module.description || '',
        order: module.order
      })
    }
  }, [module])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = module ? `/api/instructor/modules/${module.id}` : '/api/instructor/modules'
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {module ? 'Editar Módulo' : 'Novo Módulo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título do Módulo *
            </label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Introdução à Cibersegurança"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ordem
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Salvando...' : (module ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Lesson Modal Component
function LessonModal({ 
  moduleId, 
  lesson, 
  onClose, 
  onSuccess 
}: { 
  moduleId: string
  lesson: Lesson | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'VIDEO' as const,
    duration: 0,
    order: 0,
    videoUrl: '',
    attachment: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        content: lesson.content,
        type: lesson.type as any,
        duration: lesson.duration || 0,
        order: lesson.order,
        videoUrl: lesson.videoUrl || '',
        attachment: lesson.attachment || ''
      })
    }
  }, [lesson])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = lesson ? `/api/instructor/lessons/${lesson.id}` : '/api/instructor/lessons'
      const method = lesson ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {lesson ? 'Editar Aula' : 'Nova Aula'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título da Aula *
              </label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Introdução aos Conceitos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Aula *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="VIDEO">Vídeo</option>
                <option value="TEXT">Texto</option>
                <option value="QUIZ">Quiz</option>
                <option value="PRACTICAL">Prática</option>
                <option value="CTF">CTF</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Conteúdo *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Conteúdo da aula..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duração (min)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ordem
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
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
              Anexo
            </label>
            <input
              type="url"
              value={formData.attachment}
              onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="URL do anexo"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Salvando...' : (lesson ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
