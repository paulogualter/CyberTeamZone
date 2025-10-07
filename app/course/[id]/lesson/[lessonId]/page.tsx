'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlayIcon, 
  UserCircleIcon,
  StarIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { Course, Module, Lesson } from '@/types'
import Image from 'next/image'
import VideoPlayer from '@/components/VideoPlayer'
import CourseSidebar from '@/components/CourseSidebar'
import CourseHeader from '@/components/CourseHeader'

interface CourseContent extends Course {
  modules: (Module & { lessons: Lesson[] })[]
}

export default function CourseLessonViewer() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<CourseContent | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [videoProgress, setVideoProgress] = useState(0)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [ratingLoaded, setRatingLoaded] = useState(false)
  const [lessonCompleted, setLessonCompleted] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [isManualComplete, setIsManualComplete] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCourseContent()
      fetchUserProfile()
      fetchUserProgress()
    }
  }, [params.id])

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
      const response = await fetch(`/api/courses/${params.id}/content`)
      const data = await response.json()
      
      if (data.success) {
        setCourse(data.course)
        // Set first lesson as current if no lessonId in params
        if (data.course.modules && data.course.modules.length > 0) {
          const firstLesson = data.course.modules[0].lessons[0]
          if (firstLesson && !params.lessonId) {
            setCurrentLesson(firstLesson)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching course content:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      if (data.success) {
        setUserProfile(data.user)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`/api/user/course-progress?courseId=${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data.progress)
      } else {
        const errorData = await response.json()
        console.error('Erro ao buscar progresso:', errorData)
      }
    } catch (error) {
      console.error('Erro ao buscar progresso do usuário:', error)
    }
  }

  const fetchLessonRating = async () => {
    if (!currentLesson) return
    
    try {
      const response = await fetch(`/api/lessons/rating?lessonId=${currentLesson.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRating(data.rating)
          setRatingLoaded(true)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar avaliação da aula:', error)
    }
  }

  const findLessonById = (course: CourseContent, lessonId: string): Lesson | null => {
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId)
      if (lesson) return lesson
    }
    return null
  }

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    setVideoProgress(0)
    setLessonCompleted(false)
    setIsManualComplete(false)
    setRating(0)
    setHoveredRating(0)
    setRatingLoaded(false)
    router.push(`/course/${params.id}/lesson/${lesson.id}`)
  }

  const handleRating = async (newRating: number) => {
    setRating(newRating)
    
    try {
      const response = await fetch('/api/lessons/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: currentLesson?.id,
          rating: newRating,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('Avaliação salva com sucesso!')
        }
      } else {
        throw new Error('Erro ao salvar avaliação')
      }
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
      // Reverter a avaliação em caso de erro
      setRating(0)
    }
  }

  const handleLogout = () => {
    // Implementar logout
    router.push('/')
  }

  const handleLessonCompleted = (lessonId: string) => {
    setLessonCompleted(true)
    // Atualizar o progresso do curso
    fetchUserProgress()
  }

  const handleManualComplete = async () => {
    if (!currentLesson || isCompleting) return

    setIsCompleting(true)

    try {
      // Marcar aula como concluída manualmente
      const response = await fetch('/api/user/course-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          completed: true,
          watchedTime: 0,
          videoDuration: 0
        }),
      })

      if (response.ok) {
        setLessonCompleted(true)
        setIsManualComplete(true)
        
        // Aguardar um pouco antes de atualizar o progresso
        setTimeout(() => {
          fetchUserProgress()
        }, 500)
        
        // Encontrar próxima aula
        const nextLesson = findNextLesson()
        if (nextLesson) {
          // Aguardar um pouco para mostrar feedback visual
          setTimeout(() => {
            handleLessonSelect(nextLesson)
          }, 2000)
        }
      } else {
        const errorData = await response.json()
        console.error('Erro na API:', errorData)
      }
    } catch (error) {
      console.error('Erro ao marcar aula como concluída:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const findNextLesson = () => {
    if (!course || !currentLesson) return null

    let foundCurrent = false
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (foundCurrent) {
          return lesson
        }
        if (lesson.id === currentLesson.id) {
          foundCurrent = true
        }
      }
    }
    return null
  }


  const calculateProgress = () => {
    if (!userProgress) return 0
    return userProgress.percentage || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Curso não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <style jsx global>{`
        .lesson-content {
          line-height: 1.6;
        }
        .lesson-content h1, .lesson-content h2, .lesson-content h3, .lesson-content h4, .lesson-content h5, .lesson-content h6 {
          color: white;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .lesson-content p {
          color: #e5e7eb;
          margin-bottom: 1rem;
        }
        .lesson-content ul, .lesson-content ol {
          color: #e5e7eb;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .lesson-content li {
          margin-bottom: 0.5rem;
        }
        .lesson-content code {
          background-color: #374151;
          color: #fbbf24;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
        }
        .lesson-content pre {
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .lesson-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #d1d5db;
        }
        .lesson-content a {
          color: #60a5fa;
          text-decoration: underline;
        }
        .lesson-content a:hover {
          color: #93c5fd;
        }
        .lesson-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .lesson-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .lesson-content th, .lesson-content td {
          border: 1px solid #374151;
          padding: 0.5rem;
          text-align: left;
        }
        .lesson-content th {
          background-color: #374151;
          color: white;
          font-weight: bold;
        }
      `}</style>
      {/* Header */}
      <CourseHeader
        courseTitle={course.title}
        currentLessonTitle={currentLesson.title}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onSettingsClick={() => {}}
        onLogout={handleLogout}
        userName={userProfile?.name || "Usuário"}
        escudos={userProfile?.escudos || 0}
        planName={userProfile?.subscriptionPlan || "Básico"}
      />

      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
                  <CourseSidebar
                    courseTitle={course.title}
                    modules={course.modules}
                    currentLessonId={currentLesson?.id}
                    progress={calculateProgress()}
                    userProgress={userProgress}
                    onLessonSelect={handleLessonSelect}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                  />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 bg-black relative" style={{ minHeight: '60vh' }}>
            <VideoPlayer
              src={currentLesson.videoUrl || '/videos/sample-video.mp4'}
              title={currentLesson.title}
              lessonId={currentLesson.id}
              onProgress={setVideoProgress}
              onTimeUpdate={(currentTime, duration) => {
                // Handle time update if needed
              }}
              onLessonCompleted={handleLessonCompleted}
            />
          </div>

          {/* Lesson Details */}
          <div className="bg-gray-800 p-6">
                    {lessonCompleted && (
                      <div className="mb-4 p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-green-400 font-medium">
                            {isManualComplete ? 'Aula marcada como concluída! Avançando para a próxima...' : 'Aula concluída com sucesso!'}
                          </span>
                        </div>
                      </div>
                    )}
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">{currentLesson.title}</h1>
                
                {/* Instructor Info */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{course.instructor?.name || 'Instrutor'}</h3>
                    <p className="text-sm text-gray-400">
                      Especialista em cibersegurança com mais de 10 anos de experiência...
                    </p>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="lesson-content"
                    dangerouslySetInnerHTML={{ 
                      __html: currentLesson.content 
                        ? currentLesson.content
                            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
                            .replace(/<iframe\b[^>]*>/gi, '') // Remove iframes
                            .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
                            .replace(/javascript:/gi, '') // Remove javascript: URLs
                        : 'Conteúdo da lição não disponível.'
                    }} 
                  />
                </div>

                {/* Lesson Attachment */}
                {currentLesson.attachment && (
                  <div className="mt-8 p-6 bg-slate-800 border border-slate-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Material de Apoio
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {currentLesson.attachment.split('/').pop()}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Clique para baixar o material
                          </p>
                        </div>
                      </div>
                      <a
                        href={currentLesson.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Baixar</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="ml-8 space-y-4">
                {/* Mark as Complete Button */}
          {!lessonCompleted && (
            <div>
              <button
                onClick={handleManualComplete}
                disabled={isCompleting}
                className={`w-full font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  isCompleting 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isCompleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Marcar como Concluída</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {lessonCompleted && (
            <div className="flex space-x-3">
              {/* Concluído Button */}
              <div className="flex-1">
                <button
                  disabled
                  className="w-full font-medium py-3 px-6 rounded-lg bg-green-700 text-green-100 cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Concluído</span>
                </button>
              </div>
              
              {/* Próxima Aula Button */}
              <div className="flex-1">
                <button
                  onClick={() => {
                    const nextLesson = findNextLesson()
                    if (nextLesson) {
                      handleLessonSelect(nextLesson)
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Próxima</span>
                </button>
              </div>
            </div>
          )}

                {/* Rating Section */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Avalie essa aula</h4>
                  {ratingLoaded ? (
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => handleRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <StarIcon 
                            className={`h-5 w-5 transition-colors ${
                              star <= (hoveredRating || rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="p-1">
                          <StarIcon className="h-5 w-5 text-gray-600" />
                        </div>
                      ))}
                    </div>
                  )}
                  {rating > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Obrigado pela sua avaliação! ({rating} estrelas)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg lg:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
