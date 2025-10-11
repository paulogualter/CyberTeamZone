'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlayIcon,
  ClockIcon,
  CheckIcon,
  StarIcon,
  ShareIcon,
  BookmarkIcon,
  UserIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface Course {
  id: string
  title: string
  description: string
  instructor: {
    id: string
    name: string
    bio: string
    avatar?: string
  }
  modules: Module[]
}

interface Module {
  id: string
  title: string
  order: number
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

export default function MemberLessonViewer() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (courseId && lessonId) {
      fetchCourseData()
    }
  }, [courseId, lessonId])

  const fetchCourseData = async () => {
    try {
      console.log('🔍 Fetching real course data for:', courseId)
      
      const response = await fetch(`/api/courses/${courseId}/real-content`)
      const data = await response.json()
      
      console.log('📝 Course data response:', data)
      
      if (data.success) {
        setCourse(data.course)
        
        // Encontrar a aula específica
        const lesson = data.course.modules
          .flatMap((m: Module) => m.lessons)
          .find((l: Lesson) => l.id === lessonId)
        
        if (lesson) {
          setCurrentLesson(lesson)
          console.log('✅ Lesson found:', lesson.title)
        } else {
          console.error('❌ Lesson not found:', lessonId)
          setError('Aula não encontrada')
        }
      } else {
        console.error('❌ Course data error:', data.error)
        setError(data.error || 'Erro ao carregar dados do curso')
      }
    } catch (error) {
      console.error('❌ Error fetching course data:', error)
      setError('Erro ao carregar dados do curso')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!currentLesson) return
    
    try {
      const response = await fetch('/api/user/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          completed: true
        })
      })
      
      if (response.ok) {
        setIsCompleted(true)
        // Update progress
        const totalLessons = course?.modules.flatMap(m => m.lessons).length || 0
        const completedLessons = totalLessons // This should come from API
        setProgress(Math.round((completedLessons / totalLessons) * 100))
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error)
    }
  }

  const handleRating = async (stars: number) => {
    setRating(stars)
    try {
      await fetch('/api/lessons/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson?.id,
          rating: stars
        })
      })
    } catch (error) {
      console.error('Error rating lesson:', error)
    }
  }

  const getNextLesson = () => {
    if (!course) return null
    const allLessons = course.modules.flatMap(m => m.lessons).sort((a, b) => a.order - b.order)
    const currentIndex = allLessons.findIndex(l => l.id === lessonId)
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  }

  const getPrevLesson = () => {
    if (!course) return null
    const allLessons = course.modules.flatMap(m => m.lessons).sort((a, b) => a.order - b.order)
    const currentIndex = allLessons.findIndex(l => l.id === lessonId)
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null
  }

  const navigateToLesson = (lesson: Lesson) => {
    router.push(`/member/course/${courseId}/lesson/${lesson.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Carregando aula...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Erro ao Carregar</h1>
          <p className="text-gray-300 mb-8">{error}</p>
          <button
            onClick={() => router.push(`/member/course/${courseId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Voltar para o Curso
          </button>
        </div>
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Aula não encontrada</h1>
          <button 
            onClick={() => router.push('/member/courses')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Voltar para Cursos
          </button>
        </div>
      </div>
    )
  }

  const allLessons = course.modules.flatMap(m => m.lessons).sort((a, b) => a.order - b.order)
  const nextLesson = getNextLesson()
  const prevLesson = getPrevLesson()

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-white font-bold text-lg">CyberTeam.Zone</h1>
              <span className="text-gray-300">•</span>
              <span className="text-gray-300">{course.title} / {currentLesson.title}</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-300">
                <CogIcon className="h-5 w-5" />
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>130 Escudos</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <span>Plano DIAMOND</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <UserIcon className="h-5 w-5" />
                <span>{session?.user?.name || 'Usuário'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-gray-300 hover:text-white">
                  <BookmarkIcon className="h-5 w-5" />
                </button>
                <button className="text-gray-300 hover:text-white">
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 h-screen overflow-y-auto">
          <div className="p-6">
            <h2 className="text-white font-bold text-lg mb-4">{course.title}</h2>
            
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">PROGRESSO</span>
                <span className="text-sm text-gray-300">{progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Modules and Lessons */}
            <div className="space-y-2">
              {course.modules.map((module) => (
                <div key={module.id} className="space-y-1">
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <span className="text-white font-medium">
                      {module.order}. {module.title}
                    </span>
                    <span className="text-gray-400 text-sm">
                      ({module.lessons.length} aulas)
                    </span>
                  </div>
                  
                  <div className="ml-4 space-y-1">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => navigateToLesson(lesson)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          lesson.id === lessonId 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-300 hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <PlayIcon className="h-4 w-4" />
                          <span className="text-sm">
                            {module.order}.{lesson.order}. {lesson.title}
                          </span>
                        </div>
                        {lesson.duration && (
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span className="text-xs">{lesson.duration}min</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-800 border-t border-slate-700">
            <div className="text-center">
              <h3 className="text-white font-bold">CyberTeam.Zone</h3>
              <p className="text-gray-400 text-sm">Plataforma de Cibersegurança</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-slate-900">
          <div className="p-6">
            {/* Video Player */}
            <div className="mb-6">
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                {currentLesson.videoUrl ? (
                  <iframe
                    src={currentLesson.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <PlayIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">Vídeo não disponível</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold text-white mb-4">{currentLesson.title}</h1>
                
                {/* Instructor Info */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{course.instructor.name}</p>
                    <p className="text-gray-300 text-sm">{course.instructor.bio}</p>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="bg-slate-800 rounded-lg p-6 mb-6">
                  <h3 className="text-white font-semibold mb-4">Conteúdo da Aula</h3>
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                </div>

                {/* Support Material */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">Material de Apoio</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs">PDF</span>
                      </div>
                      <div>
                        <p className="text-white text-sm">Relatório de Pentest - Ricardo Amorim.pdf</p>
                        <p className="text-gray-400 text-xs">Clique para baixar o material</p>
                      </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                      Baixar
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Actions */}
              <div className="space-y-6">
                {/* Mark Complete */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <button
                    onClick={handleMarkComplete}
                    disabled={isCompleted}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors ${
                      isCompleted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <CheckIcon className="h-5 w-5" />
                    <span>{isCompleted ? 'Concluída' : 'Marcar como Concluída'}</span>
                  </button>
                </div>

                {/* Rating */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">Avalie essa aula</h3>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        {star <= rating ? (
                          <StarSolidIcon className="h-6 w-6 text-yellow-400" />
                        ) : (
                          <StarIcon className="h-6 w-6" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <div className="space-y-3">
                    {prevLesson && (
                      <button
                        onClick={() => navigateToLesson(prevLesson)}
                        className="w-full flex items-center space-x-2 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        <ChevronLeftIcon className="h-5 w-5 text-gray-300" />
                        <span className="text-gray-300 text-sm">Aula Anterior</span>
                      </button>
                    )}
                    
                    {nextLesson && (
                      <button
                        onClick={() => navigateToLesson(nextLesson)}
                        className="w-full flex items-center space-x-2 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        <span className="text-gray-300 text-sm">Próxima Aula</span>
                        <ChevronRightIcon className="h-5 w-5 text-gray-300" />
                      </button>
                    )}
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