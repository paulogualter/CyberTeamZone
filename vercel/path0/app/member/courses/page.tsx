'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeIcon,
  UserIcon,
  AcademicCapIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { Course } from '@/types'

export default function MemberCourses() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, completed, in-progress, not-started
  const [sortBy, setSortBy] = useState('recent') // recent, progress, title
  const [showCanceledMessage, setShowCanceledMessage] = useState(false)

  useEffect(() => {
    fetchUserCourses()
    
    // Verificar se o usuário cancelou um pagamento
    if (searchParams.get('canceled') === 'true') {
      setShowCanceledMessage(true)
      // Remover o parâmetro da URL após 5 segundos
      setTimeout(() => {
        setShowCanceledMessage(false)
        router.replace('/member/courses')
      }, 5000)
    }
  }, [searchParams, router])

  // Função para filtrar e ordenar cursos
  useEffect(() => {
    let filtered = [...courses]

    // Filtro por texto de pesquisa
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course as any).instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por tipo de progresso
    if (filterType === 'completed') {
      filtered = filtered.filter(course => (course.progress || 0) === 100)
    } else if (filterType === 'in-progress') {
      filtered = filtered.filter(course => (course.progress || 0) > 0 && (course.progress || 0) < 100)
    } else if (filterType === 'not-started') {
      filtered = filtered.filter(course => (course.progress || 0) === 0)
    }

    // Ordenação
    if (sortBy === 'progress') {
      filtered.sort((a, b) => (b.progress || 0) - (a.progress || 0))
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => {
        const aDate = new Date(((a as any).enrolledAt || (a as any).updatedAt || (a as any).createdAt || Date.now()))
        const bDate = new Date(((b as any).enrolledAt || (b as any).updatedAt || (b as any).createdAt || Date.now()))
        return bDate.getTime() - aDate.getTime()
      })
    }

    setFilteredCourses(filtered)
  }, [courses, searchTerm, filterType, sortBy])

  const fetchUserCourses = async () => {
    try {
      const response = await fetch('/api/user/enrollments')
      const data = await response.json()
      
      if (data.success) {
        setCourses(data.courses)
        setFilteredCourses(data.courses)
      }
    } catch (error) {
      console.error('Error fetching user courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando seus cursos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BookOpenIcon className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Meus Cursos</h1>
                <p className="text-gray-300">Continue aprendendo</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Olá, {session?.user?.name || 'Membro'}</p>
              <p className="text-xs text-gray-400">CyberTeam.Zone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem de Cancelamento */}
      {showCanceledMessage && (
        <div className="bg-yellow-600 border-b border-yellow-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-200">
                    Pagamento cancelado. Você pode tentar novamente a qualquer momento.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCanceledMessage(false)}
                className="text-yellow-200 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="bg-slate-700 border-b border-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <HomeIcon className="h-4 w-4" />
                <span className="text-sm">Dashboard</span>
              </button>
              <button
                onClick={() => router.push('/member/courses')}
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <AcademicCapIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Meus Cursos</span>
              </button>
              <button
                onClick={() => router.push('/courses')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <BookOpenIcon className="h-4 w-4" />
                <span className="text-sm">Explorar Cursos</span>
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                <span className="text-sm">Perfil</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <TrophyIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-gray-300">Conquistas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar cursos, instrutores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filter Dropdown */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os cursos</option>
                  <option value="in-progress">Em andamento</option>
                  <option value="completed">Concluídos</option>
                  <option value="not-started">Não iniciados</option>
                </select>
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="progress">Por progresso</option>
                  <option value="title">Por título</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Info */}
        {courses.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-white">
                  {filteredCourses.length} de {courses.length} cursos
                </h2>
                {searchTerm && (
                  <span className="text-sm text-gray-400">
                    para "{searchTerm}"
                  </span>
                )}
                {filterType !== 'all' && (
                  <span className="text-sm text-blue-400">
                    {filterType === 'completed' ? 'Concluídos' :
                     filterType === 'in-progress' ? 'Em andamento' :
                     filterType === 'not-started' ? 'Não iniciados' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                  setSortBy('recent')
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-gray-300 mb-6">
              Você ainda não está inscrito em nenhum curso.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Explorar Cursos
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-gray-300 mb-6">
              Tente ajustar os filtros ou termo de pesquisa.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterType('all')
                setSortBy('recent')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-slate-700"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={course.coverImage || '/images/default-course.jpg'}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.courseType === 'RECORDED' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : course.courseType === 'ONLINE'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {course.courseType === 'RECORDED' ? 'Gravado' :
                       course.courseType === 'ONLINE' ? 'Online' : 'Híbrido'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {course.duration}h
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {course.shortDescription}
                  </p>
                  
                  {/* Barra de Progresso */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Progresso</span>
                      <span className="text-sm text-gray-400">{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <ClockIcon className="h-3 w-3" />
                        <span>{course.duration}h</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{course.completedLessons || 0}/{course.totalLessons || 0} aulas</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-green-400">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Inscrito</span>
                    </div>
                    {course.progress === 100 && (
                      <div className="flex items-center space-x-2 text-sm text-yellow-400">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Concluído</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => router.push(`/member/course/${course.id}`)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span>Continuar Curso</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
