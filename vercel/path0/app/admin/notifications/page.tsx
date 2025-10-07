'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  PhotoIcon,
  XMarkIcon,
  HomeIcon,
  UserIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface PopupNotification {
  id: string
  title: string
  message?: string
  imageUrl?: string
  type: string
  status: string
  timer?: number
  startDate?: string
  endDate?: string
  targetRoles?: string
  createdAt: string
  creator: {
    id: string
    name: string
    email: string
  }
}

export default function NotificationsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<PopupNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingNotification, setEditingNotification] = useState<PopupNotification | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    imageUrl: '',
    type: 'POPUP',
    status: 'ACTIVE',
    timer: 5,
    startDate: '',
    endDate: '',
    targetRoles: [] as string[]
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchNotifications()
  }, [session, status, router])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/popup-notifications')
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/popup-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Notificação criada com sucesso!')
        setShowCreateModal(false)
        resetForm()
        fetchNotifications()
      } else {
        toast.error(data.error || 'Erro ao criar notificação')
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      toast.error('Erro ao criar notificação')
    }
  }

  const handleUpdate = async () => {
    if (!editingNotification) return

    try {
      const response = await fetch('/api/admin/popup-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingNotification.id,
          ...formData
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Notificação atualizada com sucesso!')
        setShowEditModal(false)
        setEditingNotification(null)
        resetForm()
        fetchNotifications()
      } else {
        toast.error(data.error || 'Erro ao atualizar notificação')
      }
    } catch (error) {
      console.error('Error updating notification:', error)
      toast.error('Erro ao atualizar notificação')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notificação?')) return

    try {
      const response = await fetch(`/api/admin/popup-notifications?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Notificação excluída com sucesso!')
        fetchNotifications()
      } else {
        toast.error(data.error || 'Erro ao excluir notificação')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Erro ao excluir notificação')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const response = await fetch('/api/admin/popup-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Notificação ${currentStatus === 'ACTIVE' ? 'desativada' : 'ativada'} com sucesso!`)
        fetchNotifications()
      } else {
        toast.error(data.error || 'Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const openEditModal = (notification: PopupNotification) => {
    setEditingNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message || '',
      imageUrl: notification.imageUrl || '',
      type: notification.type,
      status: notification.status,
      timer: notification.timer || 5,
      startDate: notification.startDate ? new Date(notification.startDate).toISOString().slice(0, 16) : '',
      endDate: notification.endDate ? new Date(notification.endDate).toISOString().slice(0, 16) : '',
      targetRoles: notification.targetRoles ? JSON.parse(notification.targetRoles) : []
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      imageUrl: '',
      type: 'POPUP',
      status: 'ACTIVE',
      timer: 5,
      startDate: '',
      endDate: '',
      targetRoles: []
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Menu */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h2 className="text-lg font-semibold text-white">Navegação</h2>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8 py-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <HomeIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ChartBarIcon className="h-5 w-5" />
              <span>Admin</span>
            </Link>
            <Link
              href="/admin/courses"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <BookOpenIcon className="h-5 w-5" />
              <span>Cursos</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <UserIcon className="h-5 w-5" />
              <span>Usuários</span>
            </Link>
            <Link
              href="/admin/students"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <UserGroupIcon className="h-5 w-5" />
              <span>Alunos</span>
            </Link>
            <Link
              href="/admin/notifications"
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <BellIcon className="h-5 w-5" />
              <span>Notificações</span>
            </Link>
            <Link
              href="/member/courses"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <CogIcon className="h-5 w-5" />
              <span>Área do Membro</span>
            </Link>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden space-y-2 py-4"
            >
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HomeIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>Admin</span>
              </Link>
              <Link
                href="/admin/courses"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BookOpenIcon className="h-5 w-5" />
                <span>Cursos</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserIcon className="h-5 w-5" />
                <span>Usuários</span>
              </Link>
              <Link
                href="/admin/students"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserGroupIcon className="h-5 w-5" />
                <span>Alunos</span>
              </Link>
              <Link
                href="/admin/notifications"
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BellIcon className="h-5 w-5" />
                <span>Notificações</span>
              </Link>
              <Link
                href="/member/courses"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CogIcon className="h-5 w-5" />
                <span>Área do Membro</span>
              </Link>
            </motion.nav>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Notificações Popup</h1>
              <p className="text-gray-300">Gerencie notificações que aparecem para os usuários</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nova Notificação</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhuma notificação criada
            </h3>
            <p className="text-gray-400 mb-6">
              Crie sua primeira notificação popup para os usuários
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Criar Primeira Notificação
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {notification.title}
                    </h3>
                    {notification.message && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openEditModal(notification)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Excluir"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {notification.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={notification.imageUrl}
                      alt={notification.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>Timer: {notification.timer || 'Sem timer'}s</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>Criado em: {new Date(notification.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {notification.targetRoles && (
                    <div className="flex items-center text-sm text-gray-400">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      <span>Roles: {JSON.parse(notification.targetRoles).join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    notification.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {notification.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(notification.id, notification.status)}
                    className={`p-2 rounded-lg transition-colors ${
                      notification.status === 'ACTIVE'
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-green-400 hover:bg-green-900/20'
                    }`}
                    title={notification.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                  >
                    {notification.status === 'ACTIVE' ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {showCreateModal ? 'Criar Notificação' : 'Editar Notificação'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  setEditingNotification(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              showCreateModal ? handleCreate() : handleUpdate()
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Título da notificação"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="POPUP">Popup</option>
                    <option value="BANNER">Banner</option>
                    <option value="MODAL">Modal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mensagem da notificação (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timer (segundos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.timer}
                    onChange={(e) => setFormData({ ...formData, timer: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Início
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Fim
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Roles Alvo
                </label>
                <div className="space-y-2">
                  {['STUDENT', 'INSTRUCTOR', 'ADMIN'].map((role) => (
                    <label key={role} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, targetRoles: [...formData.targetRoles, role] })
                          } else {
                            setFormData({ ...formData, targetRoles: formData.targetRoles.filter(r => r !== role) })
                          }
                        }}
                        className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setEditingNotification(null)
                    resetForm()
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showCreateModal ? 'Criar' : 'Atualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
