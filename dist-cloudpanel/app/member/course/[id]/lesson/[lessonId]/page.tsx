'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlayIcon, 
  UserCircleIcon,
  StarIcon,
  Bars3Icon,
  CheckCircleIcon,
  EyeIcon,
  ArrowLeftIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'
import { Course, Module, Lesson } from '@/types'
import Image from 'next/image'
import VideoPlayer from '@/components/VideoPlayer'

interface CourseContent extends Course {
  modules: (Module & { lessons: Lesson[] })[]
}

export default function MemberCourseLessonViewer() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [course, setCourse] = useState<CourseContent | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [ratingLoaded, setRatingLoaded] = useState(false)
  const [lessonCompleted, setLessonCompleted] = useState(false)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [isManualComplete, setIsManualComplete] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (params.id) {
      fetchCourseContent()
      fetchUserProgress()
    }
  }, [params.id])

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Marcar aula sem vídeo como concluída automaticamente
  useEffect(() => {
    if (currentLesson && currentLesson.type !== 'VIDEO' && !currentLesson.videoUrl) {
      handleLessonCompleted(currentLesson.id)
    }
  }, [currentLesson])

  // Buscar avaliação da aula quando ela mudar
  useEffect(() => {
    if (currentLesson) {
      fetchLessonRating()
    }
  }, [currentLesson])

  // Verificar se a aula já foi concluída quando userProgress carrega
  useEffect(() => {
    if (currentLesson && userProgress && userProgress.progressMap) {
      const isCompleted = userProgress.progressMap[currentLesson.id]?.completed || false
      setLessonCompleted(isCompleted)
    }
  }, [currentLesson, userProgress])

  useEffect(() => {
    if (course && params.lessonId) {
      const lesson = findLessonById(course, params.lessonId as string)
      if (lesson) {
        setCurrentLesson(lesson)
      }
    }
  }, [course, params.lessonId])

  const fetchCourseContent = async () => {
    try {
      const response = await fetch(`/api/user/course-progress?courseId=${params.id}`)
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

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`/api/user/course-progress?courseId=${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setUserProgress(data.progress)
      }
    } catch (error) {
      console.error('Error fetching user progress:', error)
    }
  }

  const findLessonById = (course: CourseContent, lessonId: string): Lesson | null => {
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId)
      if (lesson) return lesson
    }
    return null
  }

  const handleLessonClick = (lesson: Lesson) => {
    setRating(0)
    setHoveredRating(0)
    setRatingLoaded(false)
    router.push(`/member/course/${params.id}/lesson/${lesson.id}`)
  }

  const handleRating = async (newRating: number) => {
    if (!currentLesson) return

    try {
      const response = await fetch('/api/lessons/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          rating: newRating,
        }),
      })

      if (response.ok) {
        setRating(newRating)
      }
    } catch (error) {
      console.error('Error rating lesson:', error)
    }
  }

  const fetchLessonRating = async () => {
    if (!currentLesson) return

    try {
      const response = await fetch(`/api/lessons/rating?lessonId=${currentLesson.id}`)
      const data = await response.json()
      
      if (data.success) {
        setRating(data.rating || 0)
      }
    } catch (error) {
      console.error('Error fetching lesson rating:', error)
    } finally {
      setRatingLoaded(true)
    }
  }

  const handleLessonCompleted = async (lessonId: string) => {
    if (isCompleting) return

    setIsCompleting(true)
    try {
      const response = await fetch('/api/user/course-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          completed: true,
          watchedTime: videoProgress,
        }),
      })

      if (response.ok) {
        setLessonCompleted(true)
        setIsManualComplete(true)
        // Refresh progress
        fetchUserProgress()
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error)
    } finally {
      setIsCompleting(false)
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

  const isLessonCompleted = (lessonId: string) => {
    return userProgress?.progressMap?.[lessonId]?.completed || false
  }

  const getNextLesson = () => {
    if (!course || !currentLesson) return null

    for (const module of course.modules) {
      const currentIndex = module.lessons.findIndex(l => l.id === currentLesson.id)
      if (currentIndex !== -1) {
        // Check if there's a next lesson in this module
        if (currentIndex < module.lessons.length - 1) {
          return module.lessons[currentIndex + 1]
        }
        // Check next module
        const currentModuleIndex = course.modules.findIndex(m => m.id === module.id)
        if (currentModuleIndex < course.modules.length - 1) {
          const nextModule = course.modules[currentModuleIndex + 1]
          if (nextModule.lessons.length > 0) {
            return nextModule.lessons[0]
          }
        }
      }
    }
    return null
  }

  const handleNextLesson = () => {
    const nextLesson = getNextLesson()
    if (nextLesson) {
      handleLessonClick(nextLesson)
    }
  }

  const handleLogout = () => {
    router.push('/api/auth/signout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando aula...</div>
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Aula não encontrada</div>
          <button 
            onClick={() => router.push('/member/course/' + params.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Voltar ao Curso
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={() => router.push('/member/course/' + params.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-xl font-bold text-white truncate">CyberTeam.Zone</h1>
                <p className="text-xs lg:text-sm text-gray-400 truncate">{course.title} / {currentLesson.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs lg:text-sm text-gray-400">Área de Membros</div>
                <div className="text-white font-medium text-sm lg:text-base truncate max-w-32 lg:max-w-none">{session?.user?.name}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <UserCircleIcon className="h-6 w-6 lg:h-8 lg:w-8" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile Overlay */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${isMobile ? (sidebarOpen ? 'fixed left-0 top-0 w-80 h-full z-50' : 'hidden') : 'block w-80'} bg-slate-800 transition-all duration-300 min-h-screen`}>
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-lg font-bold text-white truncate">{course.title}</h2>
              <div className="flex items-center space-x-2">
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </button>
                )}
                {sidebarOpen && isMobile && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <span className="text-xl">×</span>
                  </button>
                )}
              </div>
            </div>

            {(sidebarOpen || !isMobile) && (
              <>
                {/* Progress Bar */}
                <div className="mb-4 lg:mb-6">
                  <div className="flex justify-between text-xs lg:text-sm text-gray-400 mb-2">
                    <span>PROGRESSO</span>
                    <span>{userProgress?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${userProgress?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Modules */}
                <div className="space-y-2">
                  {course.modules.map((module) => (
                    <div key={module.id} className="border border-slate-700 rounded-lg">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-sm lg:text-base truncate">{module.title}</span>
                        <span className="text-xs lg:text-sm text-gray-400 flex-shrink-0 ml-2">
                          {expandedModules.has(module.id) ? '▼' : '▶'}
                        </span>
                      </button>
                      
                      {expandedModules.has(module.id) && (
                        <div className="px-3 lg:px-4 pb-2 lg:pb-3 space-y-1">
                          {module.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson)}
                              className={`w-full text-left px-2 lg:px-3 py-1.5 lg:py-2 rounded text-xs lg:text-sm transition-colors flex items-center space-x-2 ${
                                currentLesson.id === lesson.id
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-300 hover:bg-slate-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                {isLessonCompleted(lesson.id) ? (
                                  <CheckCircleIcon className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <EyeIcon className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                                )}
                                <span className="truncate">{lesson.title}</span>
                                {lesson.attachment && (
                                  <PaperClipIcon className="h-3 w-3 lg:h-4 lg:w-4 text-blue-400 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Mobile Sidebar Toggle */}
          <div className="mb-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <Bars3Icon className="h-5 w-5" />
              <span className="text-sm">Menu do Curso</span>
            </button>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Video Player */}
            <div className="bg-slate-800 rounded-lg overflow-hidden mb-4 lg:mb-6">
              <div className="aspect-video w-full min-h-[250px] sm:min-h-[350px] lg:min-h-[500px]">
                <VideoPlayer
                  src={currentLesson.videoUrl || ''}
                  title={currentLesson.title}
                  lessonId={currentLesson.id}
                  onProgress={setVideoProgress}
                  onLessonCompleted={() => handleLessonCompleted(currentLesson.id)}
                />
              </div>
            </div>

            {/* Lesson Info */}
            <div className="bg-slate-800 rounded-lg p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">{currentLesson.title}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-400">
                    <span>Instrutor: {course.instructor?.name || 'N/A'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{currentLesson.duration || 'N/A'} min</span>
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="prose prose-invert max-w-none mb-4 lg:mb-6">
                <p className="text-gray-300 text-sm lg:text-base">{currentLesson.content || 'Conteúdo da aula...'}</p>
              </div>

              {/* Attachment */}
              {currentLesson.attachment && (
                <div className="mb-4 lg:mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <PaperClipIcon className="h-5 w-5 text-blue-400" />
                    <span>Anexo</span>
                  </h4>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <a
                      href={currentLesson.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="truncate">
                        {currentLesson.attachment.split('/').pop() || 'Download Anexo'}
                      </span>
                    </a>
                  </div>
                </div>
              )}


              {/* Action Buttons */}
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => handleLessonCompleted(currentLesson.id)}
                    disabled={lessonCompleted || isCompleting}
                    className={`px-4 lg:px-6 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                      lessonCompleted
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {lessonCompleted ? '✓ Concluído' : 'Marcar como Concluída'}
                  </button>
                  
                  {getNextLesson() && (
                    <button
                      onClick={handleNextLesson}
                      className="px-4 lg:px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-sm lg:text-base"
                    >
                      Próxima Aula
                    </button>
                  )}
                </div>

                {/* Rating */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <span className="text-sm text-gray-400">Avalie essa aula:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        <StarIcon
                          className={`h-4 w-4 lg:h-5 lg:w-5 ${
                            star <= (hoveredRating || rating)
                              ? 'text-yellow-400 fill-current'
                              : ''
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
