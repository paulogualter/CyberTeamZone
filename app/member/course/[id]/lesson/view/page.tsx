'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  DocumentTextIcon,
  PuzzlePieceIcon,
  WrenchScrewdriverIcon,
  FlagIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'
import { Course, Module, Lesson } from '@/types'

export default function AdminMemberView() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchCourseContent()
    }
  }, [params.id])

  const fetchCourseContent = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔍 Fetching course content for admin member view:', params.id)
      
      const response = await fetch(`/api/admin/courses/${params.id}/content`)
      const data = await response.json()
      
      console.log('📊 Response data:', data)
      
      if (data.success) {
        setCourse(data.course)
        // Expand first module by default
        if (data.course.modules && data.course.modules.length > 0) {
          setExpandedModules(new Set([data.course.modules[0].id]))
        }
      } else {
        setError(data.error || 'Erro ao carregar curso')
        console.error('❌ Error response:', data)
      }
    } catch (error) {
      console.error('❌ Error fetching course content:', error)
      setError('Erro ao carregar conteúdo do curso')
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayIcon className="h-5 w-5 text-blue-500" />
      case 'TEXT':
        return <DocumentTextIcon className="h-5 w-5 text-green-500" />
      case 'QUIZ':
        return <PuzzlePieceIcon className="h-5 w-5 text-purple-500" />
      case 'PRACTICAL':
        return <WrenchScrewdriverIcon className="h-5 w-5 text-orange-500" />
      case 'CTF':
        return <FlagIcon className="h-5 w-5 text-red-500" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'Vídeo'
      case 'TEXT':
        return 'Texto'
      case 'QUIZ':
        return 'Quiz'
      case 'PRACTICAL':
        return 'Prática'
      case 'CTF':
        return 'CTF'
      default:
        return 'Aula'
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando curso...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Erro ao carregar curso</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Curso não encontrado</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">{course.title}</h1>
                <p className="text-sm text-gray-400">Visualização da área de membros</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                Admin View
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayIcon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{course.title}</h2>
                <p className="text-gray-400 text-sm mb-4">{course.description}</p>
                
                {course.instructor && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                    <span>Instrutor:</span>
                    <span className="font-medium">{course.instructor.name}</span>
                  </div>
                )}
              </div>

              {/* Course Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Módulos:</span>
                  <span className="text-white font-medium">{course.modules?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Aulas:</span>
                  <span className="text-white font-medium">
                    {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id
                    if (firstLessonId) {
                      router.push(`/member/course/${course.id}/lesson/${firstLessonId}`)
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                >
                  <PlayIcon className="h-5 w-5" />
                  Assistir Primeira Aula
                </button>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Conteúdo do Curso</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {course.modules?.length || 0} módulos • {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0} aulas
                </p>
              </div>

              <div className="p-6">
                {!course.modules || course.modules.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">Nenhum módulo encontrado</h4>
                    <p className="text-gray-400">Este curso ainda não possui módulos cadastrados.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="border border-slate-600 rounded-lg">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full p-4 text-left hover:bg-slate-700 transition-colors rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {moduleIndex + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{module.title}</h4>
                                <p className="text-sm text-gray-400">
                                  {module.lessons?.length || 0} aulas
                                </p>
                              </div>
                            </div>
                            <div className="text-gray-400">
                              {expandedModules.has(module.id) ? '−' : '+'}
                            </div>
                          </div>
                        </button>

                        {expandedModules.has(module.id) && (
                          <div className="px-4 pb-4">
                            <div className="space-y-2">
                              {module.lessons?.map((lesson, lessonIndex) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => handleLessonClick(lesson)}
                                  className="w-full p-3 text-left hover:bg-slate-600 rounded-lg transition-colors flex items-center space-x-3"
                                >
                                  {getLessonIcon(lesson.type)}
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-medium text-white">
                                        {lessonIndex + 1}. {lesson.title}
                                      </span>
                                      <span className="px-2 py-1 bg-slate-600 text-gray-300 text-xs rounded-full">
                                        {getLessonTypeLabel(lesson.type)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                                      {lesson.duration && (
                                        <div className="flex items-center space-x-1">
                                          <ClockIcon className="h-3 w-3" />
                                          <span>{formatDuration(lesson.duration)}</span>
                                        </div>
                                      )}
                                      {lesson.isPublished && (
                                        <div className="flex items-center space-x-1 text-green-400">
                                          <CheckCircleIcon className="h-3 w-3" />
                                          <span>Publicada</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
