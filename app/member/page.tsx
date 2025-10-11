'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookOpenIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  StarIcon,
  ShareIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

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

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string
  instructorId: string
  modules: Module[]
}

export default function MemberArea() {
  const { data: session } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchCourses()
    } else {
      router.push('/auth/signin')
    }
  }, [session, router])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/test/courses')
      const data = await response.json()
      
      if (data.success) {
        setCourses(data.courses)
      } else {
        setError(data.error || 'Erro ao carregar cursos')
      }
    } catch (err: any) {
      console.error('Error loading courses:', err.message)
      setError('Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }

  const handleLessonClick = (courseId: string, lessonId: string) => {
    router.push(`/member/course/${courseId}/lesson/${lessonId}`)
  }

  const getTotalLessons = (course: Course) => {
    return course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)
  }

  const getTotalDuration = (course: Course) => {
    return course.modules.reduce((total, module) => 
      total + (module.lessons?.reduce((moduleTotal, lesson) => moduleTotal + (lesson.duration || 0), 0) || 0), 0
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchCourses} 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold text-blue-400 mb-4"
          >
            🎓 Área de Membros
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300"
          >
            Bem-vindo, {session?.user?.name}! Continue sua jornada de aprendizado.
          </motion.p>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-16"
          >
            <BookOpenIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-300 mb-4">
              Nenhum curso disponível
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Ainda não há cursos cadastrados no sistema.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Voltar ao Início
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105"
              >
                {/* Course Header */}
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                        {course.title}
                      </h2>
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <PlayIcon className="h-4 w-4" />
                        {getTotalLessons(course)} aulas
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {getTotalDuration(course)} min
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      {course.instructorId || 'Instrutor'}
                    </div>
                  </div>
                </div>

                {/* Modules and Lessons */}
                <div className="p-6">
                  {course.modules.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">Nenhum módulo disponível</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        📚 Módulos do Curso
                      </h3>
                      {course.modules.map((module) => (
                        <div key={module.id} className="bg-slate-700 rounded-lg p-4">
                          <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                            <BookOpenIcon className="h-5 w-5 text-blue-300" />
                            Módulo {module.order}: {module.title}
                          </h4>
                          
                          {module.lessons.length === 0 ? (
                            <p className="text-gray-500 italic ml-7">
                              Nenhuma aula disponível neste módulo.
                            </p>
                          ) : (
                            <div className="space-y-2 ml-7">
                              {module.lessons.map((lesson) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => handleLessonClick(course.id, lesson.id)}
                                  className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-slate-600 transition-colors duration-200 group"
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.isPublished ? (
                                      <PlayIcon className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                                    ) : (
                                      <ClockIcon className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300" />
                                    )}
                                    <span className="text-gray-200 group-hover:text-white text-lg">
                                      {lesson.order}. {lesson.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    {lesson.duration && (
                                      <span>{lesson.duration} min</span>
                                    )}
                                    {lesson.isPublished ? (
                                      <span className="px-2 py-1 bg-green-800 text-green-200 text-xs rounded-full">
                                        Publicada
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-yellow-800 text-yellow-200 text-xs rounded-full">
                                        Rascunho
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Course Actions */}
                <div className="p-6 bg-slate-700 border-t border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <BookmarkIcon className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <ShareIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarSolidIcon
                          key={star}
                          className="h-4 w-4 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
