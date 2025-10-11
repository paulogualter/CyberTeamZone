'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  PlayIcon,
  ClockIcon,
  CheckIcon,
  BookOpenIcon,
  UserIcon
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

export default function MemberCoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      
      // Buscar cursos diretamente do Supabase via API simples
      const response = await fetch('/api/test/courses')
      const data = await response.json()
      
      if (data.success) {
        setCourses(data.courses)
        console.log('✅ Courses loaded:', data.courses)
      } else {
        console.error('❌ Error loading courses:', data.error)
        setError(data.error || 'Erro ao carregar cursos')
      }
      
    } catch (error) {
      console.error('❌ Error fetching courses:', error)
      setError('Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando cursos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Erro: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎓 Área de Membros
          </h1>
          <p className="text-gray-300 text-lg">
            Acompanhe suas aulas e cursos cadastrados
          </p>
          {session?.user && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg">
              <p className="text-white">
                <UserIcon className="h-5 w-5 inline mr-2" />
                Logado como: <strong>{session.user.name}</strong>
              </p>
              <p className="text-gray-300 text-sm">
                Role: {session.user.role}
              </p>
            </div>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl text-gray-300 mb-2">Nenhum curso encontrado</h3>
            <p className="text-gray-400">
              Não há cursos cadastrados no sistema ainda.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {course.title}
                    </h2>
                    <p className="text-gray-300 mb-2">
                      {course.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-400">
                      <UserIcon className="h-4 w-4 mr-1" />
                      Instrutor: {course.instructor.name}
                    </div>
                  </div>
                </div>

                {course.modules && course.modules.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Módulos e Aulas:
                    </h3>
                    {course.modules.map((module) => (
                      <div key={module.id} className="bg-slate-700 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-white mb-3">
                          📚 {module.title}
                        </h4>
                        
                        {module.lessons && module.lessons.length > 0 ? (
                          <div className="grid gap-3">
                            {module.lessons.map((lesson) => (
                              <div 
                                key={lesson.id} 
                                className="bg-slate-600 rounded-lg p-4 hover:bg-slate-500 transition-colors cursor-pointer"
                                onClick={() => {
                                  window.open(`/member/course/${course.id}/lesson/${lesson.id}`, '_blank')
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <PlayIcon className="h-5 w-5 text-blue-400" />
                                    <div>
                                      <h5 className="text-white font-medium">
                                        {lesson.title}
                                      </h5>
                                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                                        {lesson.duration && (
                                          <div className="flex items-center">
                                            <ClockIcon className="h-4 w-4 mr-1" />
                                            {lesson.duration} min
                                          </div>
                                        )}
                                        <div className="flex items-center">
                                          <CheckIcon className="h-4 w-4 mr-1" />
                                          {lesson.isPublished ? 'Publicada' : 'Rascunho'}
                                        </div>
                                        <span className="text-xs">
                                          {lesson.type}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-400">
                                      Ordem: {lesson.order}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">
                            Nenhuma aula cadastrada neste módulo.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">
                    Nenhum módulo cadastrado neste curso.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}