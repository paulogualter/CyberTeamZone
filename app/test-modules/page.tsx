'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  PlayIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { Module } from '@/types'

export default function TestModulesPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false)

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
      fetchModules()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/instructor/courses/${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        setCourse(data.course)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      toast.error('Erro ao carregar dados do curso')
    }
  }

  const fetchModules = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching modules for course:', courseId)
      
      // Usar endpoint de teste que não requer autenticação
      const response = await fetch(`/api/test/modules-simulated?courseId=${courseId}`)
      const data = await response.json()
      
      console.log('📊 Modules response:', data)
      
      if (data.success) {
        setModules(data.modules || [])
        console.log('✅ Modules loaded:', data.modules?.length || 0)
      } else {
        console.error('Error fetching modules:', data.error)
        toast.error(data.error || 'Erro ao carregar módulos')
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
      toast.error('Erro ao carregar módulos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async (moduleData: any) => {
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...moduleData,
          courseId
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Módulo criado com sucesso!')
        setShowCreateModuleModal(false)
        fetchModules()
      } else {
        toast.error(data.error || 'Erro ao criar módulo')
      }
    } catch (error) {
      console.error('Error creating module:', error)
      toast.error('Erro ao criar módulo')
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo?')) return

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Módulo excluído com sucesso!')
        fetchModules()
      } else {
        toast.error(data.error || 'Erro ao excluir módulo')
      }
    } catch (error) {
      console.error('Error deleting module:', error)
      toast.error('Erro ao excluir módulo')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando módulos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {course?.title || 'Carregando...'}
              </h1>
              <p className="text-gray-400">
                Gerenciar módulos e aulas do curso
              </p>
            </div>
            <button
              onClick={() => setShowCreateModuleModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Novo Módulo
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
          <p><strong>Course ID:</strong> {courseId}</p>
          <p><strong>Modules Count:</strong> {modules.length}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <div className="mt-2">
            <strong>Modules:</strong>
            <pre className="text-xs mt-1 bg-gray-700 p-2 rounded">
              {JSON.stringify(modules.map(m => ({ id: m.id, title: m.title })), null, 2)}
            </pre>
          </div>
        </div>

        {/* Modules Grid */}
        {modules.length === 0 ? (
          <div className="text-center py-12">
            <PuzzlePieceIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Nenhum módulo encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              Crie seu primeiro módulo para começar a organizar o conteúdo do curso.
            </p>
            <button
              onClick={() => setShowCreateModuleModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors mx-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Criar Primeiro Módulo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors overflow-hidden border border-slate-700"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {module.description || 'Sem descrição'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{(module as any).lessons?.length || 0} aulas</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        module.isPublished ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                      }`}>
                        {module.isPublished ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => router.push(`/instructor/courses/${courseId}/modules/${module.id}/lessons`)}
                      className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" /> Gerenciar
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" /> Excluir
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Module Modal */}
        {showCreateModuleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Criar Módulo</h3>
              <p className="text-gray-400 mb-4">
                Esta é uma página de teste. Para criar módulos, use a página oficial.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateModuleModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
