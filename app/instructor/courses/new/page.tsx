'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  BookOpenIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CreateCourse() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    escudosPrice: 0,
    duration: 0,
    categoryId: '',
    instructorId: '',
    coverImage: '',
    difficulty: 'BEGINNER' as const,
    status: 'ACTIVE' as const,
    courseType: 'RECORDED' as const,
    startDate: '',
    isPublished: false
  })
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [coverPreview, setCoverPreview] = useState('')
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

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

  // Instructor is resolved automatically on the backend using the logged-in user's email

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas arquivos de imagem são permitidos')
      return
    }

    // Preview local imediato
    try {
      const localUrl = URL.createObjectURL(file)
      setCoverPreview(localUrl)
    } catch {}

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'courses')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          coverImage: data.url || data.fileUrl
        }))
        toast.success('Imagem enviada com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao enviar imagem')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(`Erro ao fazer upload do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Curso criado com sucesso! Aguardando aprovação do administrador.')
        router.push('/instructor/courses')
      } else {
        toast.error(data.error || 'Erro ao criar curso')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error('Erro ao criar curso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Page Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Criar Novo Curso</h1>
              <p className="text-gray-300">Preencha as informações do seu curso</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Informações Básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título do Curso *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Introdução à Cibersegurança"
                  />
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
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* O instrutor será definido automaticamente como o usuário logado (resolvido no backend) */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dificuldade
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BEGINNER">Iniciante</option>
                    <option value="INTERMEDIATE">Intermediário</option>
                    <option value="ADVANCED">Avançado</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
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
              </div>
            </div>

            {/* Course Type and Schedule */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Tipo e Cronograma</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Curso
                  </label>
                  <select
                    value={formData.courseType}
                    onChange={(e) => setFormData({ ...formData, courseType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RECORDED">Gravado</option>
                    <option value="ONLINE">Online</option>
                    <option value="HYBRID">Híbrido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Início
                    {(formData.courseType === ('ONLINE' as any) || formData.courseType === ('HYBRID' as any)) && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required={formData.courseType === ('ONLINE' as any) || formData.courseType === ('HYBRID' as any)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={formData.courseType === ('RECORDED' as any)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.courseType === ('RECORDED' as any) 
                      ? 'Cursos gravados não precisam de data de início'
                      : 'Obrigatório para cursos online e híbridos'
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-300">
                    Publicar curso imediatamente
                  </span>
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Se desmarcado, o curso será criado como rascunho e poderá ser publicado posteriormente
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Descrição</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição Curta
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Uma breve descrição do curso"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição Completa
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva detalhadamente o que os alunos aprenderão neste curso"
                  />
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Imagem de Capa</h2>
              <div className="space-y-4">
                {(coverPreview || formData.coverImage) && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={coverPreview || formData.coverImage}
                      alt="Preview"
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImage: '' })}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                )}
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="cover-image-upload"
                  />
                  <label
                    htmlFor="cover-image-upload"
                    className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {uploadingImage ? 'Enviando...' : 'Escolher Imagem'}
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Formatos aceitos: JPG, PNG, GIF, WEBP. Tamanho máximo: 5MB. Recomendado: 16:9 (ex: 1280x720)
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing and Duration */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Preços e Duração</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      const priceVal = parseFloat(e.target.value) || 0
                      const autoEscudos = Math.floor(priceVal / 0.50)
                      setFormData({ ...formData, price: priceVal, escudosPrice: autoEscudos })
                    }}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preço em Escudos
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.escudosPrice}
                      onChange={(e) => setFormData({ ...formData, escudosPrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duração (horas)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Criando...' : 'Criar Curso'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
