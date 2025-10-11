'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  BookOpenIcon,
  PlayIcon,
  ClockIcon,
  UserIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

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

export default function MemberCoursePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/content`)
      const data = await response.json()
      
      if (data.success) {
        setCourse(data.course)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateToFirstLesson = () => {
    if (course?.modules && course.modules.length > 0) {
      const firstModule = course.modules[0]
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        const firstLesson = firstModule.lessons[0]
        router.push(`/member/course/${courseId}/lesson/${firstLesson.id}`)
        return
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <ExclamationTriangleIcon className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-4">Curso não encontrado</h1>
          <p className="text-gray-300 mb-6">Este curso não existe ou você não tem acesso a ele.</p>
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

  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/member/courses')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <h1 className="text-white font-bold text-lg">{course.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Info */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpenIcon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
              <p className="text-gray-300 mb-4">{course.description}</p>
              
              {/* Instructor Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{course.instructor.name}</p>
                  <p className="text-gray-400 text-sm">{course.instructor.bio}</p>
                </div>
              </div>

              {/* Course Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-300">
                <div className="flex items-center space-x-1">
                  <BookOpenIcon className="h-4 w-4" />
                  <span>{course.modules.length} módulos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <PlayIcon className="h-4 w-4" />
                  <span>{totalLessons} aulas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        {course.modules.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Módulos do Curso</h3>
            
            {course.modules.map((module) => (
              <div key={module.id} className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">
                    {module.order}. {module.title}
                  </h4>
                  <span className="text-gray-400 text-sm">
                    {module.lessons.length} aulas
                  </span>
                </div>

                {module.lessons.length > 0 ? (
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => router.push(`/member/course/${courseId}/lesson/${lesson.id}`)}
                        className="w-full flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <PlayIcon className="h-4 w-4 text-blue-400" />
                          <span className="text-white">
                            {module.order}.{lesson.order}. {lesson.title}
                          </span>
                        </div>
                        {lesson.duration && (
                          <div className="flex items-center space-x-1 text-gray-400">
                            <ClockIcon className="h-4 w-4" />
                            <span className="text-sm">{lesson.duration}min</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <p>Nenhuma aula disponível neste módulo</p>
                  </div>
                )}
              </div>
            ))}

            {/* Start Course Button */}
            {totalLessons > 0 && (
              <div className="text-center pt-6">
                <button
                  onClick={navigateToFirstLesson}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
                >
                  <PlayIcon className="h-5 w-5" />
                  <span>Começar Curso</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800 rounded-lg">
            <BookOpenIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum módulo disponível</h3>
            <p className="text-gray-400 mb-6">
              Este curso ainda não possui módulos e aulas cadastrados.
            </p>
            <button 
              onClick={() => router.push('/member/courses')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Voltar para Cursos
            </button>
          </div>
        )}
      </div>
    </div>
  )
}