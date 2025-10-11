'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Course {
  id: string
  title: string
  description: string
  shortDescription: string
  price: number
  coverImage?: string
  instructorId: string
  approvalStatus: string
  createdAt: string
  updatedAt: string
}

export default function CourseRegistration() {
  const { data: session } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    coverImage: ''
  })

  useEffect(() => {
    console.log('🔍 Admin Courses Page - Session:', session)
    console.log('🔍 Admin Courses Page - User Role:', session?.user?.role)
    
    if (!session) {
      console.log('❌ No session found, redirecting to signin')
      router.push('/auth/signin')
      return
    }
    
    if (session?.user?.role && ['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      console.log('✅ Valid role, fetching courses')
      fetchCourses()
    } else {
      console.log('❌ Invalid role:', session.user?.role, 'redirecting to home')
      router.push('/')
    }
  }, [session, router])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      const data = await response.json()
      
      if (data.success) {
        setCourses(data.courses)
      } else {
        console.error('Error fetching courses:', data.error)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.success) {
        setCourses([data.course, ...courses])
        setFormData({
          title: '',
          description: '',
          shortDescription: '',
          price: 0,
          coverImage: ''
        })
        setShowForm(false)
        alert('Curso criado com sucesso!')
      } else {
        alert('Erro ao criar curso: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Erro ao criar curso')
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Tem certeza que deseja deletar este curso?')) return

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        setCourses(courses.filter(course => course.id !== courseId))
        alert('Curso deletado com sucesso!')
      } else {
        alert('Erro ao deletar curso: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Erro ao deletar curso')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando cursos...</p>
          <div className="mt-4 text-sm text-gray-400">
            <p>Session Status: {session ? '✅ Logged in' : '❌ Not logged in'}</p>
            <p>User Role: {session?.user?.role || 'N/A'}</p>
            <p>User Name: {session?.user?.name || 'N/A'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-400 mb-2">
              🎓 Gerenciar Cursos
            </h1>
            <p className="text-gray-300">
              {session?.user?.role === 'ADMIN' ? 'Administração de todos os cursos' : 'Seus cursos como instrutor'}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Novo Curso
          </button>
        </div>

        {/* Course List */}
        <div className="grid gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{course.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.approvalStatus === 'APPROVED' 
                        ? 'bg-green-600 text-white' 
                        : course.approvalStatus === 'PENDING'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                      {course.approvalStatus === 'APPROVED' ? 'Aprovado' : 
                       course.approvalStatus === 'PENDING' ? 'Pendente' : 'Rejeitado'}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-3">{course.shortDescription}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      R$ {course.price.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpenIcon className="h-4 w-4" />
                      Criado em {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/courses/${course.id}/modules`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Gerenciar Módulos
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl text-gray-300 mb-2">Nenhum curso encontrado</h3>
            <p className="text-gray-400 mb-4">
              {session?.user?.role === 'ADMIN' 
                ? 'Não há cursos cadastrados no sistema.' 
                : 'Você ainda não criou nenhum curso.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Criar Primeiro Curso
            </button>
          </div>
        )}
      </div>

      {/* Course Creation Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Criar Novo Curso</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título do Curso *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição Completa *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição Curta
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Será gerada automaticamente se não preenchida"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL da Imagem de Capa
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <CheckIcon className="h-4 w-4" />
                  Criar Curso
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}