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
  UserIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Instructor } from '@/types'
import toast from 'react-hot-toast'
import Header from '@/components/Header'

export default function AdminInstructorsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchInstructors()
  }, [session, status, router])

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/instructors')
      const data = await response.json()
      if (data.success) {
        setInstructors(data.instructors)
      }
    } catch (error) {
      console.error('Error fetching instructors:', error)
      toast.error('Erro ao carregar instrutores')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInstructor = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este instrutor?')) return

    try {
      const response = await fetch(`/api/instructors/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Instrutor excluído com sucesso!')
        fetchInstructors()
      } else {
        toast.error(data.error || 'Erro ao excluir instrutor')
      }
    } catch (error) {
      console.error('Error deleting instructor:', error)
      toast.error('Erro ao excluir instrutor')
    }
  }

  const openStatsModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor)
    setShowStatsModal(true)
  }

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Instrutores</h1>
            <p className="text-gray-400">Crie, edite e gerencie todos os instrutores do sistema</p>
          </div>

          {/* Actions Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar instrutores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Novo Instrutor
            </button>
          </div>

          {/* Instructors Grid */}
          {filteredInstructors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstructors.map((instructor, index) => (
                <motion.div
                  key={instructor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-600 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {instructor.name}
                        </h3>
                        <p className="text-gray-400 text-sm flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {instructor.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingInstructor(instructor)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInstructor(instructor.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {instructor.bio && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {instructor.bio}
                    </p>
                  )}

                  {instructor.expertise && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-400">Especialidades:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          try {
                            const skills = JSON.parse(instructor.expertise as string);
                            if (Array.isArray(skills)) {
                              return skills.map((skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ));
                            }
                            return null;
                          } catch (e) {
                            console.error('Error parsing expertise:', e);
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      instructor.isActive 
                        ? 'bg-green-600/20 text-green-300' 
                        : 'bg-red-600/20 text-red-300'
                    }`}>
                      {instructor.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="text-gray-400">
                      {instructor.stats?.publishedCourses || 0} cursos publicados
                    </span>
                  </div>

                  {/* Stats Preview */}
                  {instructor.stats && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-4">
                      <div className="flex items-center">
                        <BookOpenIcon className="h-3 w-3 mr-1" />
                        <span>{instructor.stats.totalCourses} total</span>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-3 w-3 mr-1" />
                        <span>{instructor.stats.totalEnrollments} alunos</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openStatsModal(instructor)}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center"
                    >
                      <ChartBarIcon className="h-3 w-3 mr-1" />
                      Estatísticas
                    </button>
                    <button
                      onClick={() => setEditingInstructor(instructor)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteInstructor(instructor.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Nenhum instrutor encontrado
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece criando seu primeiro instrutor'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Criar Primeiro Instrutor
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingInstructor) && (
        <InstructorModal
          instructor={editingInstructor}
          onClose={() => {
            setShowCreateModal(false)
            setEditingInstructor(null)
          }}
          onSuccess={() => {
            fetchInstructors()
            setShowCreateModal(false)
            setEditingInstructor(null)
          }}
        />
      )}

      {/* Stats Modal */}
      <InstructorStatsModal
        instructor={selectedInstructor}
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </div>
  )
}

// Instructor Modal Component
function InstructorModal({ 
  instructor, 
  onClose, 
  onSuccess 
}: { 
  instructor: Instructor | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    expertise: [] as string[],
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: ''
    },
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [newExpertise, setNewExpertise] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (instructor) {
      setFormData({
        name: instructor.name,
        email: instructor.email,
        bio: instructor.bio || '',
        avatar: instructor.avatar || '',
        expertise: instructor.expertise ? (() => {
          try {
            const parsed = JSON.parse(instructor.expertise as string);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.error('Error parsing expertise:', e);
            return [];
          }
        })() : [],
        socialLinks: instructor.socialLinks ? (() => {
          try {
            const parsed = JSON.parse(instructor.socialLinks as string);
            return typeof parsed === 'object' && parsed !== null ? parsed : {
              linkedin: '',
              twitter: '',
              github: ''
            };
          } catch (e) {
            console.error('Error parsing socialLinks:', e);
            return {
              linkedin: '',
              twitter: '',
              github: ''
            };
          }
        })() : {
          linkedin: '',
          twitter: '',
          github: ''
        },
        isActive: instructor.isActive
      })
    }
  }, [instructor])

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }))
      setNewExpertise('')
    }
  }

  const removeExpertise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }))
  }

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

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'instructors')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          avatar: data.url
        }))
        toast.success('Imagem enviada com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao enviar imagem')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = instructor ? `/api/instructors/${instructor.id}` : '/api/instructors'
      const method = instructor ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        if (instructor) {
          toast.success('Instrutor atualizado com sucesso!')
        } else {
          toast.success('Instrutor criado com sucesso!')
          // Show generated password
          if (data.generatedPassword) {
            toast.success(`Senha gerada: ${data.generatedPassword}`, {
              duration: 10000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #3b82f6'
              }
            })
          }
        }
        onSuccess()
      } else {
        toast.error(data.error || 'Erro ao salvar instrutor')
      }
    } catch (error) {
      console.error('Error saving instructor:', error)
      toast.error('Erro ao salvar instrutor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {instructor ? 'Editar Instrutor' : 'Novo Instrutor'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Foto do Instrutor
                </label>
                <div className="space-y-4">
                  {formData.avatar && (
                    <div className="flex items-center space-x-4">
                      <img
                        src={formData.avatar}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: '' })}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploadingImage && (
                    <div className="flex items-center space-x-2 text-blue-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      <span className="text-sm">Enviando imagem...</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Bio and Status */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Biografia
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                  Instrutor ativo
                </label>
              </div>
            </div>
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Especialidades
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newExpertise}
                onChange={(e) => setNewExpertise(e.target.value)}
                placeholder="Adicionar especialidade..."
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
              />
              <button
                type="button"
                onClick={addExpertise}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeExpertise(index)}
                    className="text-blue-300 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Links Sociais
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Twitter</label>
                <input
                  type="url"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">GitHub</label>
                <input
                  type="url"
                  value={formData.socialLinks.github}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, github: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
              {loading ? 'Salvando...' : (instructor ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal de Estatísticas do Instrutor
function InstructorStatsModal({ 
  instructor, 
  isOpen, 
  onClose 
}: { 
  instructor: Instructor | null
  isOpen: boolean
  onClose: () => void 
}) {
  if (!isOpen || !instructor || !instructor.stats) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Estatísticas do Instrutor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Instructor Info */}
        <div className="flex items-center space-x-4 mb-6 p-4 bg-slate-700/50 rounded-lg">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{instructor.name}</h3>
            <p className="text-gray-400">{instructor.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Cursos */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">Cursos</h4>
              <BookOpenIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Total:</span>
                <span className="text-white font-semibold">{instructor.stats.totalCourses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Publicados:</span>
                <span className="text-green-400 font-semibold">{instructor.stats.publishedCourses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Pendentes:</span>
                <span className="text-yellow-400 font-semibold">{instructor.stats.pendingCourses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Rejeitados:</span>
                <span className="text-red-400 font-semibold">{instructor.stats.rejectedCourses}</span>
              </div>
            </div>
          </div>

          {/* Alunos e Receita */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">Performance</h4>
              <UsersIcon className="h-6 w-6 text-green-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Total de Alunos:</span>
                <span className="text-white font-semibold">{instructor.stats.totalEnrollments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Receita Total:</span>
                <span className="text-green-400 font-semibold">
                  R$ {instructor.stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Status Chart */}
        <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">Status dos Cursos</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">Aprovados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ width: `${instructor.stats.totalCourses > 0 ? (instructor.stats.publishedCourses / instructor.stats.totalCourses) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-white font-semibold">{instructor.stats.publishedCourses}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300">Pendentes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${instructor.stats.totalCourses > 0 ? (instructor.stats.pendingCourses / instructor.stats.totalCourses) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-white font-semibold">{instructor.stats.pendingCourses}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircleIcon className="h-4 w-4 text-red-400" />
                <span className="text-gray-300">Rejeitados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-red-400 h-2 rounded-full" 
                    style={{ width: `${instructor.stats.totalCourses > 0 ? (instructor.stats.rejectedCourses / instructor.stats.totalCourses) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-white font-semibold">{instructor.stats.rejectedCourses}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  )
}
