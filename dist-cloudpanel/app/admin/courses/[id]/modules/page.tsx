'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  PlayIcon,
  BookOpenIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { Module, Lesson } from '@/types'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import ModuleModal from '@/components/admin/ModuleModal'
import LessonModal from '@/components/admin/LessonModal'

export default function CourseModulesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [courseTitle, setCourseTitle] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchModules()
  }, [session, status, router, courseId])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/modules?courseId=${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        setModules(data.modules)
        if (data.modules.length > 0) {
          setCourseTitle(data.modules[0].course?.title || 'Curso')
        }
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
      toast.error('Erro ao carregar módulos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = () => {
    setEditingModule(null)
    setShowModuleModal(true)
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setShowModuleModal(true)
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo? Todas as aulas serão excluídas também.')) return

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

  const handleCreateLesson = (module: Module) => {
    setSelectedModule(module)
    setEditingLesson(null)
    setShowLessonModal(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    // Find the module that contains this lesson
    const module = modules.find(m => m.lessons?.some(l => l.id === lesson.id))
    setSelectedModule(module || null)
    setEditingLesson(lesson)
    setShowLessonModal(true)
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Aula excluída com sucesso!')
        fetchModules()
      } else {
        toast.error(data.error || 'Erro ao excluir aula')
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error('Erro ao excluir aula')
    }
  }

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayIcon className="h-4 w-4" />
      case 'TEXT':
        return <BookOpenIcon className="h-4 w-4" />
      case 'QUIZ':
        return <BookOpenIcon className="h-4 w-4" />
      case 'PRACTICAL':
        return <BookOpenIcon className="h-4 w-4" />
      case 'CTF':
        return <BookOpenIcon className="h-4 w-4" />
      default:
        return <BookOpenIcon className="h-4 w-4" />
    }
  }

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'bg-red-100 text-red-800'
      case 'TEXT':
        return 'bg-blue-100 text-blue-800'
      case 'QUIZ':
        return 'bg-green-100 text-green-800'
      case 'PRACTICAL':
        return 'bg-purple-100 text-purple-800'
      case 'CTF':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Módulos e Aulas - {courseTitle}
                </h1>
                <p className="text-gray-400">
                  Gerencie os módulos e aulas deste curso
                </p>
              </div>
              <button
                onClick={handleCreateModule}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Novo Módulo</span>
              </button>
            </div>
          </div>

          {/* Modules List */}
          <div className="space-y-6">
            {modules.length > 0 ? (
              modules.map((module, moduleIndex) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: moduleIndex * 0.1 }}
                  className="bg-slate-800 rounded-xl overflow-hidden"
                >
                  {/* Module Header */}
                  <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Módulo {module.order}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-gray-400 text-sm mt-1">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          module.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {module.isPublished ? 'Publicado' : 'Rascunho'}
                        </span>
                        <button
                          onClick={() => handleEditModule(module)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-white">
                        Aulas ({module.lessons?.length || 0})
                      </h4>
                      <button
                        onClick={() => handleCreateLesson(module)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Nova Aula</span>
                      </button>
                    </div>

                    {module.lessons && module.lessons.length > 0 ? (
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: lessonIndex * 0.05 }}
                            className="bg-slate-700 rounded-lg p-4 hover:bg-slate-650 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="bg-slate-600 text-white px-2 py-1 rounded text-sm font-medium">
                                  {lesson.order}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getLessonTypeIcon(lesson.type)}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLessonTypeColor(lesson.type)}`}>
                                    {lesson.type}
                                  </span>
                                </div>
                                <div>
                                  <h5 className="text-white font-medium">
                                    {lesson.title}
                                  </h5>
                                  {lesson.duration && (
                                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                                      <ClockIcon className="h-3 w-3" />
                                      <span>{lesson.duration} min</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  lesson.isPublished 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {lesson.isPublished ? 'Publicado' : 'Rascunho'}
                                </span>
                                <button
                                  onClick={() => handleEditLesson(lesson)}
                                  className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">
                          Nenhuma aula cadastrada neste módulo
                        </p>
                        <button
                          onClick={() => handleCreateLesson(module)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Criar Primeira Aula
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Nenhum módulo cadastrado
                </h3>
                <p className="text-gray-400 mb-6">
                  Comece criando o primeiro módulo para este curso
                </p>
                <button
                  onClick={handleCreateModule}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Criar Primeiro Módulo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <ModuleModal
          module={editingModule}
          courseId={courseId}
          onClose={() => {
            setShowModuleModal(false)
            setEditingModule(null)
          }}
          onSuccess={() => {
            fetchModules()
            setShowModuleModal(false)
            setEditingModule(null)
          }}
        />
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <LessonModal
          lesson={editingLesson}
          module={selectedModule}
          onClose={() => {
            setShowLessonModal(false)
            setEditingLesson(null)
            setSelectedModule(null)
          }}
          onSuccess={() => {
            fetchModules()
            setShowLessonModal(false)
            setEditingLesson(null)
            setSelectedModule(null)
          }}
        />
      )}
    </div>
  )
}
