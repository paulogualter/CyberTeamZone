'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PhotoIcon,
  BookOpenIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { Course, Category, Instructor } from '@/types'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import Pagination from '@/components/Pagination'
import Breadcrumb from '@/components/Breadcrumb'

interface PaginationData {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedInstructor, setSelectedInstructor] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchCourses()
    fetchCategories()
    fetchInstructors()
  }, [session, status, router, currentPage, searchTerm, selectedCategory, selectedStatus, selectedInstructor])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      
      // Build query parameters for pagination
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus)
      }
      
      if (selectedInstructor !== 'all') {
        params.append('instructor', selectedInstructor)
      }
      
      const response = await fetch(`/api/admin/courses?${params.toString()}`)
      const data = await response.json()
      if (data.success) {
        setCourses(data.courses)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/instructors')
      const data = await response.json()
      if (data.success) {
        setInstructors(data.instructors)
      }
    } catch (error) {
      console.error('Error fetching instructors:', error)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
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

  const handleQuickStatusChange = async (courseId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED') => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()
      
      if (data.success) {
        const statusText = newStatus === 'ACTIVE' ? 'ativado' : 
                          newStatus === 'INACTIVE' ? 'inativado' : 'descontinuado'
        toast.success(`Curso ${statusText} com sucesso!`)
        fetchCourses()
      } else {
        toast.error(data.error || 'Erro ao alterar status do curso')
      }
    } catch (error) {
      console.error('Error changing course status:', error)
      toast.error('Erro ao alterar status do curso')
    }
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedStatus, selectedInstructor])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Cursos', current: true }
              ]}
            />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Cursos</h1>
          <p className="text-gray-400">
            {pagination ? `Mostrando ${courses.length} de ${pagination.totalCount} cursos` : `Crie, edite e gerencie todos os cursos do sistema`}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cursos, descrição ou instrutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">Todos os status</option>
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="DISCONTINUED">Descontinuado</option>
                </select>
              </div>

              {/* Instructor Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">Todos os instrutores</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold"
            >
              <PlusIcon className="h-5 w-5" />
              Novo Curso
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-xl overflow-hidden hover:bg-slate-750 transition-colors"
            >
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 relative">
                {course.coverImage && (
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.difficulty === 'BEGINNER' 
                      ? 'bg-green-500 text-white'
                      : course.difficulty === 'INTERMEDIATE'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-red-500 text-white'
                  }`}>
                    {course.difficulty === 'BEGINNER' ? 'Iniciante' : 
                     course.difficulty === 'INTERMEDIATE' ? 'Intermediário' : 'Avançado'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.status === 'ACTIVE' 
                      ? 'bg-green-600 text-white'
                      : course.status === 'INACTIVE'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {course.status === 'ACTIVE' ? 'Ativo' : 
                     course.status === 'INACTIVE' ? 'Inativo' : 'Descontinuado'}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {course.shortDescription}
                </p>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>{course.duration} horas</span>
                  <span>{course.lessonsCount || 0} aulas</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-2xl font-bold text-white">
                      R$ {course.price.toFixed(2)}
                    </span>
                    <span className="text-yellow-400 text-sm ml-2">
                      ou {course.escudosPrice} Escudos
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        // Vai direto para a área de membros usando o endpoint de admin
                        router.push(`/member/course/${course.id}/lesson/view`)
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      title="Acessar área de membros"
                    >
                      <EyeSlashIcon className="h-4 w-4" />
                      Visualizar
                    </button>
                    <button
                      onClick={() => router.push(`/admin/courses/${course.id}/modules`)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <BookOpenIcon className="h-4 w-4" />
                      Módulos
                    </button>
                  </div>
                  
                  {/* Quick Status Actions */}
                  <div className="flex gap-1">
                    {course.status !== 'ACTIVE' && (
                      <button
                        onClick={() => handleQuickStatusChange(course.id, 'ACTIVE')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Ativar
                      </button>
                    )}
                    {course.status !== 'INACTIVE' && (
                      <button
                        onClick={() => handleQuickStatusChange(course.id, 'INACTIVE')}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Inativar
                      </button>
                    )}
                    {course.status !== 'DISCONTINUED' && (
                      <button
                        onClick={() => handleQuickStatusChange(course.id, 'DISCONTINUED')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Descontinuar
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="flex-1 bg-red-800 hover:bg-red-900 text-white px-3 py-1 rounded text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <TrashIcon className="h-3 w-3" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Nenhum curso encontrado com os filtros aplicados'
                : 'Nenhum curso cadastrado ainda'
              }
            </div>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Criar Primeiro Curso
              </button>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCourse) && (
        <CourseModal
          course={editingCourse}
          categories={categories}
          instructors={instructors}
          onClose={() => {
            setShowCreateModal(false)
            setEditingCourse(null)
          }}
          onSuccess={() => {
            fetchCourses()
            setShowCreateModal(false)
            setEditingCourse(null)
          }}
        />
      )}
    </div>
  )
}

// Course Modal Component
function CourseModal({ 
  course, 
  categories, 
  instructors,
  onClose, 
  onSuccess 
}: { 
  course: Course | null
  categories: Category[]
  instructors: Instructor[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    price: 0,
    escudosPrice: 0,
    difficulty: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT',
    duration: 0,
    categoryId: '',
    instructorId: '',
    coverImage: '',
    isPublished: false,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED',
    courseType: 'RECORDED' as 'RECORDED' | 'ONLINE' | 'HYBRID'
  })
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        shortDescription: course.shortDescription || '',
        description: course.description || '',
        price: course.price,
        escudosPrice: course.escudosPrice,
        difficulty: course.difficulty,
        duration: course.duration,
        categoryId: course.categoryId,
        courseType: course.courseType || 'RECORDED',
        instructorId: course.instructorId || '',
        coverImage: course.coverImage || '',
        isPublished: course.isPublished || false,
        status: course.status || 'ACTIVE'
      })
      if (course.coverImage) {
        setPreviewUrl(course.coverImage)
      }
    }
  }, [course])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFile) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setFormData(prev => ({ ...prev, coverImage: data.fileUrl }))
        toast.success('Imagem enviada com sucesso!')
      } else {
        toast.error('Erro ao enviar imagem')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  // Garantir que a imagem selecionada seja enviada antes de salvar o curso
  const uploadCoverIfNeeded = async (): Promise<string | null> => {
    if (!selectedFile) return null
    // Se o usuário selecionou um arquivo mas ainda não enviou manualmente,
    // fazemos o upload automático aqui e retornamos a URL resultante
    try {
      const fd = new FormData()
      fd.append('file', selectedFile)

      const resp = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await resp.json()
      if (!resp.ok || !json?.success) {
        throw new Error(json?.error || 'Falha ao enviar imagem')
      }
      return json.url || json.fileUrl || null
    } catch (err) {
      console.error('Auto-upload cover failed:', err)
      toast.error('Erro ao enviar a imagem de capa')
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Se existe um arquivo selecionado e a coverImage ainda não é uma URL válida de API/CDN,
      // fazemos o upload automático antes de salvar.
      if (selectedFile && (!formData.coverImage || formData.coverImage === previewUrl)) {
        const uploadedUrl = await uploadCoverIfNeeded()
        if (uploadedUrl) {
          setFormData(prev => ({ ...prev, coverImage: uploadedUrl }))
        }
      }

      const url = course ? `/api/admin/courses/${course.id}` : '/api/admin/courses'
      const method = course ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(course ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!')
        onSuccess()
      } else {
        toast.error(data.error || 'Erro ao salvar curso')
      }
    } catch (error) {
      console.error('Error saving course:', error)
      toast.error('Erro ao salvar curso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {course ? 'Editar Curso' : 'Novo Curso'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título do Curso *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição Curta * (máximo 60 caracteres)
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={60}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite uma descrição curta do curso..."
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {formData.shortDescription.length}/60 caracteres
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição Completa
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pricing & Settings */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preço (Escudos) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.escudosPrice}
                      onChange={(e) => setFormData({ ...formData, escudosPrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-400">
                        Auto: {Math.floor(formData.price / 0.50)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      Calculado automaticamente: floor(Preço ÷ 0,50) = {Math.floor(formData.price / 0.50)} escudos
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, escudosPrice: Math.floor(formData.price / 0.50) })}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duração (horas) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dificuldade *
                  </label>
                  <select
                    required
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BEGINNER">Iniciante</option>
                    <option value="INTERMEDIATE">Intermediário</option>
                    <option value="ADVANCED">Avançado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instrutor *
                </label>
                <select
                  required
                  value={formData.instructorId}
                  onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um instrutor</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagem de Capa
                </label>
                
                {/* Image Preview */}
                {previewUrl && (
                  <div className="mb-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-slate-600"
                    />
                  </div>
                )}

                {/* File Upload */}
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <PhotoIcon className="h-4 w-4" />
                      {uploadingImage ? 'Enviando...' : 'Enviar Imagem'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 text-sm text-gray-300">
                    Publicar curso
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status do Curso
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                    <option value="DISCONTINUED">Descontinuado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo do Curso *
                  </label>
                  <select
                    value={formData.courseType}
                    onChange={(e) => setFormData({ ...formData, courseType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="RECORDED">🎥 Gravado</option>
                    <option value="ONLINE">💻 On-line</option>
                    <option value="HYBRID">🔄 Híbrido</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? 'Salvando...' : (course ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
