'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  KeyIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Breadcrumb from '@/components/Breadcrumb'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  escudos: number
  subscriptionStatus: string
  subscriptionPlan: string | null
  _count: {
    enrollments: number
    payments: number
  }
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showCreateInstructor, setShowCreateInstructor] = useState(false)
  const [newInstructor, setNewInstructor] = useState({ name: '', email: '', password: '' })

  // Carregar usuários apenas uma vez
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchAllUsers()
  }, [session, status])

  // Filtrar usuários em tempo real
  useEffect(() => {
    filterUsers()
  }, [allUsers, searchTerm, roleFilter])

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter])

  const fetchAllUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users?limit=1000') // Buscar todos os usuários
      const data = await response.json()

      if (data.success) {
        setAllUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...allUsers]

    // Filtrar por termo de pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      )
    }

    // Filtrar por role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
    
    // Calcular paginação
    const totalCount = filtered.length
    const limit = 10
    const totalPages = Math.ceil(totalCount / limit)
    
    setPagination({
      currentPage,
      totalPages,
      totalCount,
      limit,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    })
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          role: newRole
        })
      })

      const data = await response.json()

      if (data.success) {
        setAllUsers(allUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
        setEditingUser(null)
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          isActive: !isActive
        })
      })

      const data = await response.json()

      if (data.success) {
        setAllUsers(allUsers.map(user => 
          user.id === userId ? { ...user, isActive: !isActive } : user
        ))
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handlePasswordReset = async () => {
    if (!editingUser || !newPassword) return

    try {
      const response = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: editingUser.id,
          newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowPasswordModal(false)
        setNewPassword('')
        setEditingUser(null)
        alert('Senha redefinida com sucesso!')
      } else {
        alert('Erro ao redefinir senha: ' + data.error)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Erro ao redefinir senha')
    }
  }


  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'INSTRUCTOR':
        return 'bg-blue-100 text-blue-800'
      case 'STUDENT':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador'
      case 'INSTRUCTOR':
        return 'Instrutor'
      case 'STUDENT':
        return 'Estudante'
      default:
        return role
    }
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
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Usuários', current: true }
              ]}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserGroupIcon className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admins & Instrutores</h1>
                <p className="text-gray-300">Gerencie administradores e instrutores da plataforma</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setRoleFilter('INSTRUCTOR')}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Ver Instrutores
              </button>
              <button
                onClick={() => setShowCreateInstructor(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-1" /> Novo Instrutor
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Voltar ao Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as roles</option>
                <option value="INSTRUCTOR">Instrutores</option>
                <option value="ADMIN">Administradores</option>
              </select>
            </div>
          </div>
        </div>


        {/* Users Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Escudos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cursos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {filteredUsers
                  .slice((currentPage - 1) * 10, currentPage * 10)
                  .map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.name || 'Sem nome'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser?.id === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        >
                          <option value="STUDENT">Estudante</option>
                          <option value="INSTRUCTOR">Instrutor</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <CheckIcon className="h-3 w-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XMarkIcon className="h-3 w-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.escudos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user._count.enrollments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar role"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user)
                            setShowPasswordModal(true)
                          }}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Redefinir senha"
                        >
                          <KeyIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} a {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} de {pagination.totalCount} usuários
              {searchTerm && (
                <span className="ml-2 text-blue-400">
                  (filtrados de {allUsers.length} total)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-white">
                {pagination.currentPage} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Redefinir Senha
            </h3>
            <p className="text-gray-300 mb-4">
              Nova senha para: <span className="font-medium">{editingUser.email}</span>
            </p>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha (mínimo 6 caracteres)"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setNewPassword('')
                  setEditingUser(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={newPassword.length < 6}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Redefinir Senha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Instructor Modal */}
      {showCreateInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Cadastrar Novo Instrutor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={newInstructor.name}
                  onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do instrutor"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={newInstructor.email}
                  onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Senha (opcional)</label>
                <input
                  type="password"
                  value={newInstructor.password}
                  onChange={(e) => setNewInstructor({ ...newInstructor, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
                <p className="text-xs text-gray-400 mt-1">Se não informar, o instrutor poderá usar OAuth para acessar.</p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateInstructor(false)
                  setNewInstructor({ name: '', email: '', password: '' })
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/users', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newInstructor)
                    })
                    const data = await res.json()
                    if (data.success) {
                      setShowCreateInstructor(false)
                      setNewInstructor({ name: '', email: '', password: '' })
                      fetchAllUsers()
                      alert('Instrutor criado com sucesso!')
                    } else {
                      alert(data.error || 'Erro ao criar instrutor')
                    }
                  } catch (e) {
                    alert('Erro ao criar instrutor')
                  }
                }}
                disabled={!newInstructor.email}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
