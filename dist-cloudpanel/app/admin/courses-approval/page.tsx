'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Course {
  id: string
  title: string
  description: string
  shortDescription?: string
  difficulty: string
  duration: number
  price: number
  escudosPrice: number
  coverImage?: string
  status: string
  courseType: string
  startDate?: string
  approvalStatus: string
  submittedForApprovalAt: string
  approvedAt?: string
  approvedBy?: string
  rejectionReason?: string
  instructor: {
    id: string
    name: string
    email: string
  }
  category: {
    id: string
    name: string
  }
}

export default function CoursesApproval() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState('PENDING')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchCourses()
  }, [session, status, router, currentStatus])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/courses/approval?status=${currentStatus}`)
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

  const handleApprove = async (courseId: string) => {
    setActionLoading(courseId)
    try {
      const response = await fetch('/api/admin/courses/approval', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          action: 'APPROVE'
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Curso aprovado com sucesso!')
        fetchCourses()
      } else {
        toast.error(data.error || 'Erro ao aprovar curso')
      }
    } catch (error) {
      console.error('Error approving course:', error)
      toast.error('Erro ao aprovar curso')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!selectedCourse) return

    setActionLoading(selectedCourse.id)
    try {
      const response = await fetch('/api/admin/courses/approval', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          action: 'REJECT',
          rejectionReason
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Curso rejeitado com sucesso!')
        setShowRejectModal(false)
        setSelectedCourse(null)
        setRejectionReason('')
        fetchCourses()
      } else {
        toast.error(data.error || 'Erro ao rejeitar curso')
      }
    } catch (error) {
      console.error('Error rejecting course:', error)
      toast.error('Erro ao rejeitar curso')
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectModal = (course: Course) => {
    setSelectedCourse(course)
    setShowRejectModal(true)
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
          <div>
            <h1 className="text-2xl font-bold text-white">Aprovação de Cursos</h1>
            <p className="text-gray-300">Gerencie a aprovação de cursos criados por instrutores</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'PENDING', label: 'Pendentes', count: 0 },
                { key: 'APPROVED', label: 'Aprovados', count: 0 },
                { key: 'REJECTED', label: 'Rejeitados', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCurrentStatus(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    currentStatus === tab.key
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-slate-700 text-gray-300 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-gray-400">
              {currentStatus === 'PENDING' 
                ? 'Não há cursos aguardando aprovação'
                : `Não há cursos ${currentStatus === 'APPROVED' ? 'aprovados' : 'rejeitados'}`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {course.shortDescription || course.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.approvalStatus === 'APPROVED' 
                        ? 'bg-green-100 text-green-800'
                        : course.approvalStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.approvalStatus === 'APPROVED' ? 'Aprovado' : 
                       course.approvalStatus === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>Instrutor: {course.instructor.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>Submetido em: {new Date(course.submittedForApprovalAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>Duração: {course.duration}h</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">💰</span>
                    <span>Preço: R$ {course.price.toFixed(2)} | {course.escudosPrice} escudos</span>
                  </div>
                </div>

                {course.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                    <p className="text-red-300 text-sm">
                      <strong>Motivo da rejeição:</strong> {course.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {/* TODO: Implementar visualização detalhada */}}
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Ver detalhes
                  </button>
                  
                  {course.approvalStatus === 'PENDING' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApprove(course.id)}
                        disabled={actionLoading === course.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        {actionLoading === course.id ? 'Aprovando...' : 'Aprovar'}
                      </button>
                      <button
                        onClick={() => openRejectModal(course)}
                        disabled={actionLoading === course.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Rejeitar Curso
            </h3>
            <p className="text-gray-300 mb-4">
              Tem certeza que deseja rejeitar o curso "{selectedCourse.title}"?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Motivo da rejeição (opcional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Explique o motivo da rejeição..."
              />
            </div>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedCourse(null)
                  setRejectionReason('')
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === selectedCourse.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === selectedCourse.id ? 'Rejeitando...' : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
