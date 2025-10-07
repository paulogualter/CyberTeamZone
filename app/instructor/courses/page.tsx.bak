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
              <p className="text-gray-300">Gerencie todos os seus cursos</p>
            </div>
            <button
              onClick={() => router.push('/instructor/courses/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Novo Curso</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhum curso criado ainda
            </h3>
            <p className="text-gray-400 mb-6">
              Comece criando seu primeiro curso e compartilhe seu conhecimento
            </p>
            <button
              onClick={() => router.push('/instructor/courses/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Criar Primeiro Curso
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              // Neon gradient per infosec spectrum
              (() => {
                const title = (course.title || '').toLowerCase()
                const category = ((course as any).category?.name || '').toLowerCase()
                const text = `${title} ${category}`
                let neonClass = 'from-cyan-400 via-emerald-400 to-purple-500'
                if (/red\s*team|ofensiv|offensive|pentest|pen\s*test|exploit|ataque/.test(text)) {
                  neonClass = 'from-rose-500 via-red-500 to-orange-400'
                } else if (/blue\s*team|defensiv|defense|soc|monitor|dete(c|ç)\w*/.test(text)) {
                  neonClass = 'from-sky-400 via-blue-500 to-indigo-500'
                } else if (/purple\s*team|roxo|roxa/.test(text)) {
                  neonClass = 'from-fuchsia-500 via-purple-500 to-violet-500'
                } else if (/grc|governan(c|ç)a|risco|conformidade|compliance|iso\s*27\d+/.test(text)) {
                  neonClass = 'from-amber-400 via-yellow-400 to-orange-400'
                } else if (/ctf|capture\s*the\s*flag|desafio|challenge/.test(text)) {
                  neonClass = 'from-pink-500 via-violet-500 to-indigo-500'
                } else if (/arquitet|ops|devsecops|seguran(c|ç)a\s*aplica(c|ç)\w*/.test(text)) {
                  neonClass = 'from-emerald-400 via-lime-400 to-green-500'
                }
                return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors overflow-hidden border border-slate-700"
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
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {(course as any).shortDescription || course.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => router.push(`/instructor/courses/${course.id}`)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Gerenciar curso"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Excluir curso"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <button
                    onClick={() => router.push(`/instructor/courses/${course.id}`)}
                    className="px-3 py-1.5 rounded-md text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Gerenciar Curso
                  </button>
                  <button
                    onClick={() => router.push(`/instructor/modules?courseId=${course.id}`)}
                    className="px-3 py-1.5 rounded-md text-sm bg-slate-600 hover:bg-slate-500 text-white transition-colors"
                  >
                    Criar Módulos
                  </button>
                  <button
                    onClick={() => router.push(`/instructor/lessons?courseId=${course.id}`)}
                    className="px-3 py-1.5 rounded-md text-sm bg-slate-600 hover:bg-slate-500 text-white transition-colors"
                  >
                    Criar Aulas
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{course.duration}h</span>
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    <span>{course.enrolledCount || 0} alunos</span>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>{course.rating || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (course as any).approvalStatus === 'APPROVED' 
                        ? 'bg-green-100 text-green-800'
                        : (course as any).approvalStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {(course as any).approvalStatus === 'APPROVED' ? 'Aprovado' : 
                       (course as any).approvalStatus === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(`/instructor/courses/${course.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Gerenciar
                  </button>
                </div>
                </div>
                </div>
              </motion.div>
                )
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
