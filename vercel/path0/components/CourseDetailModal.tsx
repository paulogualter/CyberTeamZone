'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  XMarkIcon, 
  ClockIcon, 
  UserGroupIcon, 
  StarIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  TrophyIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Course, Instructor } from '@/types'
import InstructorModal from './InstructorModal'
import PaymentModal from './PaymentModal'

interface CourseDetailModalProps {
  course: Course
  isOpen: boolean
  onClose: () => void
}

export default function CourseDetailModal({ course, isOpen, onClose }: CourseDetailModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const handleAdquirirCurso = () => {
    if (!session?.user) {
      onClose()
      router.push('/auth/signin')
      return
    }
    
    // Se usuário está logado, abrir modal de pagamento
    setIsPaymentModalOpen(true)
  }

  const handleInstructorClick = () => {
    setIsInstructorModalOpen(true)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'Iniciante'
      case 'INTERMEDIATE':
        return 'Intermediário'
      case 'ADVANCED':
        return 'Avançado'
      default:
        return difficulty
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <div
            className="relative bg-slate-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative">
              <img
                src={course.coverImage}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover rounded-t-xl"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty)}`}>
                  {getDifficultyText(course.difficulty)}
                </span>
              </div>
            </div>

            <div className="p-8">
              {/* Course Title and Info */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                <p className="text-xl text-gray-300 mb-6">{course.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-400">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>{course.duration} minutos</span>
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    <span>{course.enrolledCount || 0} alunos</span>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 mr-2 text-yellow-400" />
                    <span>{course.rating || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    <span>Por {course.instructor?.name || 'CyberTeam'}</span>
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* What You'll Learn */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">O que você vai aprender</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Fundamentos de cibersegurança',
                        'Técnicas de análise de vulnerabilidades',
                        'Implementação de controles de segurança',
                        'Monitoramento e detecção de ameaças',
                        'Resposta a incidentes de segurança',
                        'Boas práticas de segurança da informação'
                      ].map((item, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Modules */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Conteúdo do Curso</h3>
                    <div className="space-y-3">
                      {[
                        { title: 'Introdução à Cibersegurança', duration: '45 min', lessons: 8 },
                        { title: 'Análise de Vulnerabilidades', duration: '60 min', lessons: 12 },
                        { title: 'Implementação de Controles', duration: '75 min', lessons: 15 },
                        { title: 'Monitoramento e Detecção', duration: '50 min', lessons: 10 },
                        { title: 'Resposta a Incidentes', duration: '40 min', lessons: 8 },
                        { title: 'Projeto Prático', duration: '90 min', lessons: 5 }
                      ].map((module, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-semibold">{module.title}</h4>
                              <p className="text-gray-400 text-sm">{module.lessons} aulas • {module.duration}</p>
                            </div>
                            <div className="text-gray-400">
                              <ClockIcon className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Requisitos</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        Conhecimento básico em informática
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        Acesso a um computador com internet
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        Interesse em aprender cibersegurança
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Sidebar - Pricing and Purchase */}
                <div className="space-y-6">
                  {/* Pricing Card */}
                  <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                    <h3 className="text-xl font-bold text-white mb-4">Adquira o Curso</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between p-4 bg-slate-600/50 rounded-lg">
                        <span className="text-gray-300">Preço em Dinheiro:</span>
                        <span className="text-2xl font-bold text-white">
                          R$ {course.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                        <span className="text-gray-300">Preço em Escudos:</span>
                        <span className="text-2xl font-bold text-yellow-400">
                          {course.escudosPrice} Escudos
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleAdquirirCurso}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <BookOpenIcon className="h-6 w-6" />
                      <span>Adquirir Curso</span>
                    </button>
                  </div>

                  {/* Course Features */}
                  <div className="bg-slate-700/30 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">O que está incluído:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-300">
                        <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                        Acesso vitalício ao curso
                      </li>
                      <li className="flex items-center text-gray-300">
                        <TrophyIcon className="h-5 w-5 text-yellow-400 mr-3" />
                        Certificado de conclusão
                      </li>
                      <li className="flex items-center text-gray-300">
                        <ShieldCheckIcon className="h-5 w-5 text-blue-400 mr-3" />
                        Suporte da comunidade
                      </li>
                      <li className="flex items-center text-gray-300">
                        <BookOpenIcon className="h-5 w-5 text-purple-400 mr-3" />
                        Atualizações gratuitas
                      </li>
                      <li className="flex items-center text-gray-300">
                        <ClockIcon className="h-5 w-5 text-green-400 mr-3" />
                        Acesso em dispositivos móveis
                      </li>
                    </ul>
                  </div>

                  {/* Instructor Info */}
                  <div className="bg-slate-700/30 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Instrutor</h4>
                    <button
                      onClick={handleInstructorClick}
                      className="w-full flex items-center space-x-3 hover:bg-slate-600/30 rounded-lg p-2 -m-2 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-400 transition-colors">
                        <span className="text-white font-bold text-lg">
                          {course.instructor?.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h5 className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                          {course.instructor?.name || 'CyberTeam'}
                        </h5>
                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                          Especialista em Cibersegurança
                        </p>
                        <p className="text-blue-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Clique para ver biografia completa
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Modal */}
      {course.instructor && (
        <InstructorModal
          instructor={course.instructor}
          isOpen={isInstructorModalOpen}
          onClose={() => setIsInstructorModalOpen(false)}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        course={course}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          setIsPaymentModalOpen(false)
          onClose()
          // Redirecionar para o dashboard ou área de membros
          router.push('/dashboard')
        }}
      />
    </>
  )
}
