'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookOpenIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  UsersIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { Course } from '@/types'
import toast from 'react-hot-toast'

export default function InstructorCourses() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/instructor/courses')
      const data = await response.json()

      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Curso excluído com sucesso!')
        fetchCourses()
      } else {
        toast.error(data.error || 'Erro ao excluir curso')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Erro ao excluir curso')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Page Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Meus Cursos</h1>
              <p className="text-gray-300">Gerencie seus cursos e conteúdo</p>
            </div>
            <button
              onClick={() => router.push('/instructor/courses/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Criar Curso
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhum curso criado</h3>
            <p className="text-gray-400 mb-6">Comece criando seu primeiro curso</p>
            <button
              onClick={() => router.push('/instructor/courses/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Criar Primeiro Curso
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors overflow-hidden border-2 border-gray-500"
              >
                {/* Cover Image */}
                {course.coverImage ? (
                  <div className="relative h-40 w-full bg-slate-900">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="h-40 w-full object-cover"
                    />
                    {/* Combined status badge */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-black/60 text-white border border-white/10">
                        {(course as any).status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        {' '}
                        ({(course as any).approvalStatus === 'APPROVED' ? 'Aprovado' : (course as any).approvalStatus === 'REJECTED' ? 'Rejeitado' : 'Pendente'})
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{course.duration}h</span>
                    </div>
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      <span>0 inscritos</span>
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                      <span>0</span>
                    </div>
                  </div>

                  {/* Price and Escudos */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-white">
                        R$ {course.price.toFixed(2)}
                      </span>
                      <span className="text-yellow-400 text-sm font-medium">
                        {course.escudosPrice} Escudos
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - 2 rows of 3 buttons each */}
                  <div className="space-y-2">
                    {/* Row 1 - Primary Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => router.push(`/instructor/courses/${course.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => router.push(`/instructor/courses/${course.id}`)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        Visualizar
                      </button>
                      <button
                        onClick={() => router.push(`/instructor/courses/${course.id}/modules`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <BookOpenIcon className="h-4 w-4" />
                        Módulos
                      </button>
                    </div>
                    
                    {/* Row 2 - Management Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {/* TODO: Implement deactivate */}}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        Inativar
                      </button>
                      <button
                        onClick={() => {/* TODO: Implement discontinue */}}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        Descontinuar
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="bg-red-800 hover:bg-red-900 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Excluir
                      </button>
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