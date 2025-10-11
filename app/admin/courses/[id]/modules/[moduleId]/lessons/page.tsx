'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  PlayIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface Lesson {
  id: string
  title: string
  content: string
  videoUrl?: string
  duration?: number
  order: number
  type: string
  isPublished: boolean
  moduleId: string
  createdAt: string
  updatedAt: string
}

interface Module {
  id: string
  title: string
  courseId: string
}

interface Course {
  id: string
  title: string
}

export default function LessonManagement() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const moduleId = params.moduleId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: 0,
    type: 'VIDEO',
    isPublished: false
  })

  useEffect(() => {
    if (session?.user?.role && ['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      fetchData()
    } else {
      router.push('/')
    }
  }, [session, router, courseId, moduleId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Buscar dados do curso
      const courseResponse = await fetch(`/api/courses/${courseId}`)
      const courseData = await courseResponse.json()
      
      if (courseData.success) {
        setCourse(courseData.course)
        // Encontrar o módulo específico
        const foundModule = courseData.course.modules?.find((m: any) => m.id === moduleId)
        if (foundModule) {
          setModule(foundModule)
        }
      }

      // Buscar aulas
      const lessonsResponse = await fetch(`/api/lessons?moduleId=${moduleId}`)
      const lessonsData = await lessonsResponse.json()
      
      if (lessonsData.success) {
        setLessons(lessonsData.lessons)
      } else {
        console.error('Error fetching lessons:', lessonsData.error)
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
      const response = await fetch('/api/lessons', {
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
        setLessons([...lessons, data.lesson])
        setFormData({
          title: '',
          content: '',
          videoUrl: '',
          duration: 0,
          type: 'VIDEO',
          isPublished: false
        })
        setShowForm(false)
        alert('Aula criada com sucesso!')
      } else {
        alert('Erro ao criar aula: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating lesson:', error)
      alert('Erro ao criar aula')
    }
  }

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta aula?')) return

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        setLessons(lessons.filter(lesson => lesson.id !== lessonId))
        alert('Aula deletada com sucesso!')
      } else {
        alert('Erro ao deletar aula: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Erro ao deletar aula')
    }
  }

  const togglePublish = async (lessonId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setLessons(lessons.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, isPublished: !currentStatus }
            : lesson
        ))
        alert(`Aula ${!currentStatus ? 'publicada' : 'despublicada'} com sucesso!`)
      } else {
        alert('Erro ao atualizar status da aula: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating lesson:', error)
      alert('Erro ao atualizar aula')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!course || !module) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Módulo não encontrado</div>
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
              onClick={() => router.push(`/admin/courses/${courseId}/modules`)}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Voltar
            </button>
            <div>
              <h1 className="text-4xl font-bold text-blue-400 mb-2">
                🎥 {module.title}
              </h1>
              <p className="text-gray-300">Curso: {course.title}</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Nova Aula
          </button>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Aula {lesson.order}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      lesson.isPublished 
                        ? 'bg-green-600 text-white' 
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {lesson.isPublished ? 'Publicada' : 'Rascunho'}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-3 line-clamp-2">
                    {lesson.content.substring(0, 200)}...
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <PlayIcon className="h-4 w-4" />
                      {lesson.type}
                    </div>
                    {lesson.duration && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {lesson.duration} min
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      Criada em {new Date(lesson.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(lesson.id, lesson.isPublished)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      lesson.isPublished
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {lesson.isPublished ? (
                      <>
                        <EyeSlashIcon className="h-4 w-4" />
                        Despublicar
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-4 w-4" />
                        Publicar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => router.push(`/member/course/${courseId}/lesson/${lesson.id}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Visualizar
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Video Preview */}
              {lesson.videoUrl && (
                <div className="mt-4 border-t border-slate-700 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Vídeo:</h3>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <video
                      src={lesson.videoUrl}
                      controls
                      className="w-full max-w-md h-auto rounded"
                      poster="/images/video-placeholder.jpg"
                    >
                      Seu navegador não suporta a tag de vídeo.
                    </video>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-12">
            <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl text-gray-300 mb-2">Nenhuma aula encontrada</h3>
            <p className="text-gray-400 mb-4">
              Este módulo ainda não possui aulas cadastradas.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Criar Primeira Aula
            </button>
          </div>
        )}
      </div>

      {/* Lesson Creation Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Criar Nova Aula</h2>
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
                  Título da Aula *
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
                  Conteúdo da Aula *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Descreva o conteúdo da aula..."
                  required
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
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://exemplo.com/video.mp4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Aula
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="VIDEO">Vídeo</option>
                    <option value="TEXT">Texto</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="PRACTICAL">Prática</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPublished" className="text-sm text-gray-300">
                  Publicar aula imediatamente
                </label>
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
                  Criar Aula
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}