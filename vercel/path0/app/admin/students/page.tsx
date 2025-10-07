'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Breadcrumb from '@/components/Breadcrumb'

interface Student {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  escudos: number
  subscriptionStatus: string
  subscriptionPlan: string
  createdAt: string
  updatedAt: string
}

interface StudentMetrics {
  totalStudents: number
  studentsWithActiveSubscription: number
  studentsWithoutActiveSubscription: number
}

export default function StudentsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [metrics, setMetrics] = useState<StudentMetrics>({
    totalStudents: 0,
    studentsWithActiveSubscription: 0,
    studentsWithoutActiveSubscription: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchStudents()
  }, [session, status, router, currentPage, searchTerm, statusFilter])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/students?${params}`)
      const data = await response.json()

      if (data.success) {
        setStudents(data.students)
        setTotalPages(data.pagination.pages)
        if (data.metrics) {
          setMetrics(data.metrics)
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Erro ao carregar alunos')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchStudents()
  }

  const handleStatusChange = async (studentId: string, isActive: boolean) => {
    setActionLoading(studentId)
    try {
      const response = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          isActive
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Aluno ${isActive ? 'ativado' : 'desativado'} com sucesso!`)
        fetchStudents()
      } else {
        toast.error(data.error || 'Erro ao atualizar aluno')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      toast.error('Erro ao atualizar aluno')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEscudosChange = async (studentId: string, escudos: number) => {
    setActionLoading(studentId)
    try {
      const response = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          escudos
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Escudos atualizados com sucesso!')
        fetchStudents()
      } else {
        toast.error(data.error || 'Erro ao atualizar escudos')
      }
    } catch (error) {
      console.error('Error updating escudos:', error)
      toast.error('Erro ao atualizar escudos')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePasswordReset = async () => {
    if (!selectedStudent || !newPassword) return

    setActionLoading(selectedStudent.id)
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          newPassword
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Senha redefinida com sucesso!')
        setShowPasswordModal(false)
        setSelectedStudent(null)
        setNewPassword('')
      } else {
        toast.error(data.error || 'Erro ao redefinir senha')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Erro ao redefinir senha')
    } finally {
      setActionLoading(null)
    }
  }

  const openEditModal = (student: Student) => {
    setSelectedStudent(student)
    setShowEditModal(true)
  }

  const openPasswordModal = (student: Student) => {
    setSelectedStudent(student)
    setShowPasswordModal(true)
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
      {/* Page Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '/admin' },
                { label: 'Alunos', current: true }
              ]}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Gerenciar Alunos</h1>
              <p className="text-gray-300">Gerencie todos os alunos cadastrados na plataforma</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-slate-700 rounded-lg px-4 py-2">
                <span className="text-white font-medium">
                  Página: {students.length} alunos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Alunos</p>
                <p className="text-3xl font-bold">{metrics.totalStudents}</p>
              </div>
              <UserGroupIcon className="h-12 w-12 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Com Assinatura Ativa</p>
                <p className="text-3xl font-bold">{metrics.studentsWithActiveSubscription}</p>
                <p className="text-green-200 text-xs mt-1">
                  {metrics.totalStudents > 0 
                    ? `${Math.round((metrics.studentsWithActiveSubscription / metrics.totalStudents) * 100)}% do total`
                    : '0%'
                  }
                </p>
              </div>
              <CheckBadgeIcon className="h-12 w-12 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Sem Assinatura Ativa</p>
                <p className="text-3xl font-bold">{metrics.studentsWithoutActiveSubscription}</p>
                <p className="text-orange-200 text-xs mt-1">
                  {metrics.totalStudents > 0 
                    ? `${Math.round((metrics.studentsWithoutActiveSubscription / metrics.totalStudents) * 100)}% do total`
                    : '0%'
                  }
                </p>
              </div>
              <ExclamationTriangleIcon className="h-12 w-12 text-orange-200" />
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>

        {/* Students Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Escudos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {students.map((student) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {student.name || 'Sem nome'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-white">{student.escudos}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${
                        student.subscriptionPlan 
                          ? 'text-white' 
                          : 'text-gray-400'
                      }`}>
                        {student.subscriptionPlan || 'Nenhum'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusChange(student.id, !student.isActive)}
                          disabled={actionLoading === student.id}
                          className={`p-2 rounded-lg transition-colors ${
                            student.isActive
                              ? 'text-red-400 hover:bg-red-900/20'
                              : 'text-green-400 hover:bg-green-900/20'
                          } disabled:opacity-50`}
                          title={student.isActive ? 'Desativar' : 'Ativar'}
                        >
                          {student.isActive ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openPasswordModal(student)}
                          className="p-2 text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors"
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
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Editar Aluno
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={selectedStudent.name || ''}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedStudent.email}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Escudos
                </label>
                <input
                  type="number"
                  value={selectedStudent.escudos}
                  onChange={(e) => {
                    const newEscudos = parseInt(e.target.value) || 0
                    setSelectedStudent({ ...selectedStudent, escudos: newEscudos })
                  }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedStudent(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleEscudosChange(selectedStudent.id, selectedStudent.escudos)
                  setShowEditModal(false)
                  setSelectedStudent(null)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Redefinir Senha
            </h3>
            <p className="text-gray-300 mb-4">
              Redefinir senha para: <strong>{selectedStudent.name || selectedStudent.email}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite a nova senha..."
              />
            </div>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setSelectedStudent(null)
                  setNewPassword('')
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={!newPassword || actionLoading === selectedStudent.id}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === selectedStudent.id ? 'Redefinindo...' : 'Redefinir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
