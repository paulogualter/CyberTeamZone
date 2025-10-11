'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  CogIcon,
  PlayIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface Module {
  id: string
  title: string
  description: string
  order: number
  courseId: string
  createdAt: string
  updatedAt: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  content: string
  videoUrl?: string
  duration?: number
  order: number
  type: string
  isPublished: boolean
  createdAt: string
}

interface Course {
  id: string
  title: string
  description: string
}

export default function ModuleManagement() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })

  useEffect(() => {
    if (session?.user?.role && ['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      fetchCourseAndModules()
    } else {
      router.push('/')
    }
  }, [session, router, courseId])

  const fetchCourseAndModules = async () => {
    try {
      setLoading(true)
      
      // Buscar dados do curso
      const courseResponse = await fetch(`/api/courses/${courseId}`)
      const courseData = await courseResponse.json()
      
      if (courseData.success) {
        setCourse(courseData.course)
      }

      // Buscar módulos
      const modulesResponse = await fetch(`/api/modules?courseId=${courseId}`)
      const modulesData = await modulesResponse.json()
      
      if (modulesData.success) {
        setModules(modulesData.modules)
      } else {
        console.error('Error fetching modules:', modulesData.error)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
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
        setModules([...modules, data.module])
        setFormData({
          title: '',
          description: ''
        })
        setShowForm(false)
        alert('Módulo criado com sucesso!')
      } else {
        alert('Erro ao criar módulo: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating module:', error)
      alert('Erro ao criar módulo')
    }
  }

  const handleDelete = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja deletar este módulo? Todas as aulas serão deletadas também.')) return

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        setModules(modules.filter(module => module.id !== moduleId))
        alert('Módulo deletado com sucesso!')
      } else {
        alert('Erro ao deletar módulo: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting module:', error)
      alert('Erro ao deletar módulo')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Curso não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/courses')}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Voltar
            </button>
            <div>
              <h1 className="text-4xl font-bold text-blue-400 mb-2">
                📚 {course.title}
              </h1>
              <p className="text-gray-300">Gerenciar módulos e aulas</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Novo Módulo
          </button>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          {modules.map((module) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{module.title}</h2>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Módulo {module.order}
                    </span>
                  </div>
                  
                  {module.description && (
                    <p className="text-gray-300 mb-3">{module.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <PlayIcon className="h-4 w-4" />
                      {module.lessons?.length || 0} aulas
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {module.lessons?.reduce((total, lesson) => total + (lesson.duration || 0), 0) || 0} min
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/courses/${courseId}/modules/${module.id}/lessons`)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Gerenciar Aulas
                  </button>
                  <button
                    onClick={() => handleDelete(module.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Lessons Preview */}
              {module.lessons && module.lessons.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Aulas:</h3>
                  <div className="grid gap-2">
                    {module.lessons.slice(0, 3).map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                        <PlayIcon className="h-4 w-4 text-blue-400" />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{lesson.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            {lesson.duration && (
                              <span>{lesson.duration} min</span>
                            )}
                            <span className={`px-2 py-1 rounded text-xs ${
                              lesson.isPublished 
                                ? 'bg-green-600 text-white' 
                                : 'bg-yellow-600 text-white'
                            }`}>
                              {lesson.isPublished ? 'Publicada' : 'Rascunho'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {module.lessons.length > 3 && (
                      <div className="text-center text-gray-400 text-sm py-2">
                        +{module.lessons.length - 3} aulas adicionais
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {modules.length === 0 && (
          <div className="text-center py-12">
            <CogIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl text-gray-300 mb-2">Nenhum módulo encontrado</h3>
            <p className="text-gray-400 mb-4">
              Este curso ainda não possui módulos cadastrados.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Criar Primeiro Módulo
            </button>
          </div>
        )}
      </div>

      {/* Module Creation Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 w-full max-w-lg mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Criar Novo Módulo</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título do Módulo *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição do Módulo
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Descreva o que será abordado neste módulo..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <CheckIcon className="h-4 w-4" />
                  Criar Módulo
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}