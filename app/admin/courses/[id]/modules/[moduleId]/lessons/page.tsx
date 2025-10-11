'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import LessonList from '@/components/LessonList'
import { ArrowLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline'

export default function AdminModuleLessons() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const moduleId = params.moduleId as string
  
  const [course, setCourse] = useState<any>(null)
  const [module, setModule] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId && moduleId) {
      fetchCourseData()
      fetchModuleData()
    }
  }, [courseId, moduleId])

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        setCourse(data.course)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    }
  }

  const fetchModuleData = async () => {
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`)
      const data = await response.json()
      
      if (data.success) {
        setModule(data.module)
      }
    } catch (error) {
      console.error('Error fetching module:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!courseId || !moduleId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Parâmetros inválidos</h1>
          <button 
            onClick={() => router.push('/admin/courses')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Voltar para Cursos
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Page Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/admin/courses/${courseId}/modules`)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Aulas - {module?.title || 'Carregando...'}
                </h1>
                <p className="text-gray-300">
                  {course?.title} • Módulo: {module?.title}
                  {course?.instructor && (
                    <span className="ml-2">
                      • Instrutor: {course.instructor.name}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LessonList 
          moduleId={moduleId}
          moduleTitle={module?.title || 'Módulo'}
        />
      </div>
    </div>
  )
}

