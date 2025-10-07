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

export default function CourseViewer() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchCourseContent()
    }
  }, [params.id])

  const fetchCourseContent = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.id}/content`)
      const data = await response.json()
      
      if (data.success) {
        setCourse(data.course)
        // Expand first module by default
        if (data.course.modules && data.course.modules.length > 0) {
          setExpandedModules(new Set([data.course.modules[0].id]))
        }
      }
    } catch (error) {
      console.error('Error fetching course content:', error)
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
        return 'Prático'
      case 'CTF':
        return 'CTF'
      default:
        return 'Aula'
    }
  }

  const getCourseTypeBadge = (type: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (type) {
      case 'RECORDED':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'ONLINE':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'HYBRID':
        return `${baseClasses} bg-purple-100 text-purple-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getCourseTypeLabel = (type: string) => {
    switch (type) {
      case 'RECORDED':
        return 'Gravado'
      case 'ONLINE':
        return 'Online'
      case 'HYBRID':
        return 'Híbrido'
      default:
        return 'Curso'
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
                <p className="text-sm text-gray-400">Visualização do Conteúdo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={getCourseTypeBadge(course.courseType)}>
                {getCourseTypeLabel(course.courseType)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : course.status === 'INACTIVE'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {course.status === 'ACTIVE' ? 'Ativo' : 
                 course.status === 'INACTIVE' ? 'Inativo' : 'Descontinuado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 sticky top-8">
              <div className="space-y-6">
                {/* Course Image */}
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={course.coverImage || '/images/default-course.jpg'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Course Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Detalhes do Curso</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4" />
                        <span>{course.duration} horas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Dificuldade:</span>
                        <span className="capitalize">{course.difficulty.toLowerCase()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Preço:</span>
                        <span>R$ {course.price}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Escudos:</span>
                        <span>{course.escudosPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div>
                    <h4 className="text-md font-semibold text-white mb-2">Instrutor</h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {course.instructor?.name?.charAt(0) || 'I'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{course.instructor?.name}</p>
                        <p className="text-gray-400 text-sm">{course.instructor?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <h4 className="text-md font-semibold text-white mb-2">Categoria</h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-white">
                      {course.category?.name}
                    </span>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-md font-semibold text-white mb-2">Descrição</h4>
                    <p className="text-gray-300 text-sm">{course.description}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id
                        if (firstLessonId) {
                          router.push(`/course/${course.id}/lesson/${firstLessonId}`)
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                    >
                      <PlayIcon className="h-5 w-5" />
                      Acessar Área de Membros
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Modules */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Conteúdo do Curso</h2>
                <div className="space-y-4">
                  {course.modules?.map((module: Module, moduleIndex: number) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: moduleIndex * 0.1 }}
                      className="bg-slate-800 rounded-lg overflow-hidden"
                    >
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full px-6 py-4 text-left hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {moduleIndex + 1}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                              {module.description && (
                                <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-400">
                              {module.lessons?.length || 0} aulas
                            </span>
                            <div className={`transform transition-transform ${
                              expandedModules.has(module.id) ? 'rotate-180' : ''
                            }`}>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Module Lessons */}
                      {expandedModules.has(module.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-700"
                        >
                          <div className="p-6 space-y-3">
                            {module.lessons?.map((lesson: Lesson, lessonIndex: number) => (
                              <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: lessonIndex * 0.05 }}
                                className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
                                onClick={() => setSelectedLesson(lesson)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {lessonIndex + 1}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {getLessonIcon(lesson.type)}
                                    <span className="text-white font-medium">{lesson.title}</span>
                                    {lesson.attachment && (
                                      <PaperClipIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-xs text-gray-400 bg-slate-600 px-2 py-1 rounded">
                                    {getLessonTypeLabel(lesson.type)}
                                  </span>
                                  {lesson.isPublished ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5 text-yellow-500" />
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getLessonIcon(selectedLesson.type)}
                  <h3 className="text-xl font-semibold text-white">{selectedLesson.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="bg-slate-700 px-2 py-1 rounded">
                    {getLessonTypeLabel(selectedLesson.type)}
                  </span>
                  {selectedLesson.isPublished ? (
                    <span className="text-green-400">Publicado</span>
                  ) : (
                    <span className="text-yellow-400">Rascunho</span>
                  )}
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {selectedLesson.content}
                  </div>
                </div>

                {/* Attachment */}
                {selectedLesson.attachment && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                      <PaperClipIcon className="h-5 w-5 text-blue-400" />
                      <span>Anexo</span>
                    </h4>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <a
                        href={selectedLesson.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="truncate">
                          {selectedLesson.attachment.split('/').pop() || 'Download Anexo'}
                        </span>
                      </a>
                    </div>
                  </div>
                )}

                {selectedLesson.videoUrl && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Vídeo</h4>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <a
                        href={selectedLesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {selectedLesson.videoUrl}
                      </a>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
