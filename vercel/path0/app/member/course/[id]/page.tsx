'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
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
  UserIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
  TrophyIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  PaperClipIcon,
  HomeIcon,
  BookOpenIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { Course, Module, Lesson } from '@/types'

export default function MemberCourseViewer() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [course, setCourse] = useState<Course | null>(null)
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [showHelpMenu, setShowHelpMenu] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCourseContent()
    }
  }, [params.id])

  const fetchCourseContent = async () => {
    try {
      console.log('Fetching course content for:', params.id)
      const response = await fetch(`/api/user/course-progress?courseId=${params.id}`)
      const data = await response.json()
      
      console.log('API Response:', data)
      
      if (data.success) {
        setCourse(data.course)
        setProgress(data.progress)
        // Expand first module by default
        if (data.course.modules && data.course.modules.length > 0) {
          setExpandedModules(new Set([data.course.modules[0].id]))
        }
      } else {
        console.error('API Error:', data.error)
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

  const isLessonCompleted = (lessonId: string) => {
    return progress?.progressMap?.[lessonId]?.completed || false
  }

  const handleLogout = () => {
    router.push('/api/auth/signout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando curso...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Curso não encontrado</div>
          <div className="text-gray-400 text-sm mb-4">ID do curso: {params.id}</div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Voltar ao Dashboard
          </button>
        </div>
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
                <p className="text-sm text-gray-400">Área de Membros</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={getCourseTypeBadge(course.courseType)}>
                {getCourseTypeLabel(course.courseType)}
              </span>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4" />
                  <span>{session?.user?.name || 'Membro'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">
                    {session?.user?.escudos || 0} escudos
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
              >
                <HomeIcon className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
              <button
                onClick={() => router.push('/member/courses')}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
              >
                <BookOpenIcon className="h-4 w-4" />
                <span>Meus Cursos</span>
              </button>
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
              <span className="text-white font-medium truncate max-w-48">
                {course?.title || 'Carregando...'}
              </span>
            </div>

            {/* Help and Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHelpMenu(!showHelpMenu)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <QuestionMarkCircleIcon className="h-4 w-4" />
                <span className="text-sm">Ajuda</span>
              </button>
              <button
                onClick={() => router.push('/member/courses')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="text-sm">Voltar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Menu Dropdown */}
      {showHelpMenu && (
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Start Guide */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <PlayIcon className="h-5 w-5 text-blue-400" />
                  <span>Como Começar</span>
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Clique em "Continuar Curso" para ir para a primeira aula</li>
                  <li>• Use a barra lateral para navegar entre as aulas</li>
                  <li>• Marque as aulas como concluídas conforme avança</li>
                  <li>• Acompanhe seu progresso na barra superior</li>
                </ul>
              </div>

              {/* Course Features */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <InformationCircleIcon className="h-5 w-5 text-green-400" />
                  <span>Recursos do Curso</span>
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Vídeos interativos com controles personalizados</li>
                  <li>• Anexos e materiais complementares</li>
                  <li>• Sistema de progresso em tempo real</li>
                  <li>• Certificado ao completar o curso</li>
                </ul>
              </div>

              {/* Navigation Tips */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <TrophyIcon className="h-5 w-5 text-yellow-400" />
                  <span>Dicas de Navegação</span>
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Use as setas para navegar entre aulas</li>
                  <li>• Aulas concluídas ficam marcadas em verde</li>
                  <li>• Aulas com anexos têm ícone de clipe</li>
                  <li>• Seu progresso é salvo automaticamente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Course Info Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-slate-800 rounded-lg p-4 lg:p-6 sticky top-8">
              <div className="space-y-6">
                {/* Course Image */}
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={course.coverImage || '/images/default-course.jpg'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Progress */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">PROGRESSO</span>
                    <span className="text-sm font-semibold text-white">{progress?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress?.percentage || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {progress?.completedLessons || 0} de {progress?.totalLessons || 0} aulas concluídas
                  </p>
                  
                  {/* Continuar Curso Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        if (course?.modules && course.modules.length > 0 && course.modules[0]?.lessons && course.modules[0].lessons.length > 0) {
                          // Vai para a primeira aula dentro da área de membros
                          router.push(`/member/course/${course.id}/lesson/${course.modules[0].lessons[0].id}`)
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                    >
                      <PlayIcon className="h-5 w-5" />
                      Continuar Curso
                    </button>
                  </div>
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


                  {/* Achievement Badges */}
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-white mb-3">Conquistas Disponíveis</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-center space-x-2">
                        <TrophyIcon className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-yellow-400 text-xs font-semibold">Primeira Aula</p>
                          <p className="text-gray-300 text-xs">Complete sua primeira aula</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-3 flex items-center space-x-2">
                        <StarIcon className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-blue-400 text-xs font-semibold">Estudante Dedicado</p>
                          <p className="text-gray-300 text-xs">Complete 50% do curso</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 flex items-center space-x-2">
                        <FireIcon className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-green-400 text-xs font-semibold">Fogo no Pavio</p>
                          <p className="text-gray-300 text-xs">Complete 100% do curso</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3 flex items-center space-x-2">
                        <AcademicCapIcon className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-purple-400 text-xs font-semibold">Especialista</p>
                          <p className="text-gray-300 text-xs">Domine todos os módulos</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="space-y-4 lg:space-y-6">
              {/* Modules */}
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Conteúdo do Curso</h2>
                <div className="space-y-3 lg:space-y-4">
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
                        className="w-full px-4 lg:px-6 py-3 lg:py-4 text-left hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base flex-shrink-0">
                              {moduleIndex + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base lg:text-lg font-semibold text-white truncate">{module.title}</h3>
                              {module.description && (
                                <p className="text-gray-400 text-xs lg:text-sm mt-1 line-clamp-2">{module.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
                            <span className="text-xs lg:text-sm text-gray-400">
                              {module.lessons?.length || 0} aulas
                            </span>
                            <div className={`transform transition-transform ${
                              expandedModules.has(module.id) ? 'rotate-180' : ''
                            }`}>
                              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
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
                                  {isLessonCompleted(lesson.id) ? (
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

    </div>
  )
}
