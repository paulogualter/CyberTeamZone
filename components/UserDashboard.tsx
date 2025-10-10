'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpenIcon, 
  TrophyIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import CourseCard from './CourseCard'
import SmartCourseImage from './SmartCourseImage'
import { Course, UserProgress } from '@/types'
import { useUserEscudos } from '@/hooks/useUserEscudos'

// Mock data - in production this would come from API
const mockEnrolledCourses: any[] = [
  {
    id: '1',
    title: 'Curso Básico',
    description: 'Introdução ao sistema',
    shortDescription: 'Introdução ao sistema',
    instructor: { id: 'instructor_1', name: 'CyberTeam', email: 'admin@cyberteam.zone' } as any,
    difficulty: 'BEGINNER',
    duration: 60,
    price: 1.00,
    escudosPrice: 100,
    coverImage: '/images/curso-basico.jpg',
    videoUrl: '',
    isPublished: true,
    isFree: false,
    categoryId: 'all',
    rating: 4.5,
    enrolledCount: 101,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Network Defense and Monitoring',
    description: 'Learn to build robust network defense systems',
    shortDescription: 'Learn to build robust network defense systems...',
    instructor: { id: 'instructor_1', name: 'CyberTeam', email: 'admin@cyberteam.zone' } as any,
    difficulty: 'BEGINNER',
    duration: 360,
    price: 1.00,
    escudosPrice: 100,
    coverImage: '/images/network-defense.jpg',
    videoUrl: '',
    isPublished: true,
    isFree: false,
    categoryId: 'network-security',
    rating: 4.5,
    enrolledCount: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockProgress: UserProgress[] = [
  {
    id: '1',
    completed: false,
    progress: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1',
    courseId: '1',
  },
  {
    id: '2',
    completed: false,
    progress: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1',
    courseId: '2',
  },
]

export default function UserDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('my-courses')
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { escudos: userEscudos, refreshEscudos } = useUserEscudos()

  // Use session data only
  const currentUser = session?.user
  const userRole = (session?.user as any)?.role || 'USER'
  const userSubscription = (session?.user as any)?.subscriptionStatus || 'None'

  // Fetch user's enrolled courses
  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/user/enrollments')
        const data = await response.json()
        
        if (data.success) {
          setEnrolledCourses(data.courses || [])
          
          // Create progress data from enrollments
          const progressData = data.courses.map((course: any) => ({
            id: course.id,
            completed: course.completed,
            progress: course.progress || 0,
            createdAt: course.enrolledAt,
            updatedAt: new Date(),
            userId: currentUser?.id || '',
            courseId: course.id,
          }))
          setProgress(progressData)
        }
      } catch (error) {
        console.error('Error fetching user courses:', error)
        // Fallback to mock data if API fails
        setEnrolledCourses(mockEnrolledCourses)
        setProgress(mockProgress)
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUser) {
      fetchUserCourses()
    }
  }, [currentUser])

  // Fetch all courses for admin
  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetch('/api/courses')
        .then(res => res.json())
        .then(data => setAllCourses(data.courses || []))
        .catch(err => console.error('Error fetching courses:', err))
    }
  }, [userRole])

  const getProgressForCourse = (courseId: string) => {
    return progress.find(p => p.courseId === courseId)?.progress || 0
  }

  const stats = {
    totalCourses: enrolledCourses.length,
    completedCourses: progress.filter(p => p.completed).length,
    totalEscudos: userEscudos,
    averageProgress: progress.length > 0 
      ? Math.round(progress.reduce((acc, p) => acc + p.progress, 0) / progress.length)
      : 0,
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Olá, {currentUser?.name?.split(' ')[0] || 'Usuário'}! 👋
            </h1>
            <p className="text-gray-300">
              Continue sua jornada em cibersegurança
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-yellow-600/20 px-4 py-2 rounded-lg">
            <CurrencyDollarIcon className="h-6 w-6 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-xl">
              {userEscudos}
            </span>
            <span className="text-yellow-300">Escudos</span>
          </div>
        </div>
      </motion.div>

      {/* Subscription Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-lg p-6 border ${
          userRole === 'ADMIN'
            ? 'bg-purple-900/20 border-purple-500/20'
            : userSubscription === 'ACTIVE' || userSubscription === 'Diamond' || userSubscription === 'Gold' || userSubscription === 'Basic'
            ? 'bg-green-900/20 border-green-500/20'
            : 'bg-orange-900/20 border-orange-500/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {userRole === 'ADMIN' ? 'Status de Acesso' : 'Status da Assinatura'}
            </h3>
            <p className="text-gray-300">
              {userRole === 'ADMIN' 
                ? 'Acesso completo como administrador'
                : userSubscription === 'ACTIVE' || userSubscription === 'Diamond' || userSubscription === 'Gold' || userSubscription === 'Basic'
                ? `Plano ${userSubscription.toUpperCase()} ativo`
                : 'Nenhuma assinatura ativa'
              }
            </p>
          </div>
          <div className="text-right">
            {userRole === 'ADMIN' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                👑 Administrador
              </span>
            ) : userSubscription === 'ACTIVE' || userSubscription === 'Diamond' || userSubscription === 'Gold' || userSubscription === 'Basic' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Ativo
              </span>
            ) : (
              <a
                href="/plans"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Assinar Plano
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-400">Cursos Inscritos</p>
              <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-green-500/20">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-400">Concluídos</p>
              <p className="text-2xl font-bold text-white">{stats.completedCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-400">Progresso Médio</p>
              <p className="text-2xl font-bold text-white">{stats.averageProgress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/20">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-400">Escudos</p>
              <p className="text-2xl font-bold text-white">{stats.totalEscudos}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-blue-500/20"
      >
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'my-courses', name: 'Meus Cursos', icon: BookOpenIcon },
              { id: 'catalog', name: 'Catálogo', icon: BookOpenIcon },
              { id: 'ctf', name: 'CTF', icon: TrophyIcon },
              { id: 'certificates', name: 'Certificados', icon: TrophyIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'my-courses' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Meus Cursos</h2>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-300">Carregando seus cursos...</p>
                </div>
              ) : enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-700/50 rounded-lg p-6 border border-gray-600"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {(course.shortDescription || course.description)?.substring(0, 50)}
                          {(course.shortDescription || course.description)?.length > 50 && '...'}
                        </p>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>Progresso</span>
                          <span>{getProgressForCourse(course.id)}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressForCourse(course.id)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{course.duration}h</span>
                        </div>
                        <button 
                          onClick={() => window.location.href = `/member/course/${course.id}`}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Continuar Curso
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Nenhum curso inscrito
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Explore nosso catálogo e comece sua jornada em cibersegurança
                  </p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Explorar Catálogo
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {userRole === 'ADMIN' ? 'Todos os Cursos (Acesso Administrativo)' : 'Catálogo de Cursos'}
              </h2>
              
              {userRole === 'ADMIN' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-700/50 rounded-lg p-6 border border-gray-600"
                    >
                      <div className="mb-4">
                        <SmartCourseImage
                          src={course.coverImage}
                          alt={course.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-2">
                          {(course.shortDescription || course.description)?.substring(0, 50)}
                          {(course.shortDescription || course.description)?.length > 50 && '...'}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                          <span>Instrutor: {course.instructor?.name || 'CyberTeam'}</span>
                          <span className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                            {course.rating}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{course.duration}h</span>
                        </div>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                          Continuar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Catálogo de Cursos
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Redirecionando para o catálogo completo...
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ctf' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">CTF Challenges</h2>
              <p className="text-gray-300">
                Em breve: Desafios de Capture The Flag
              </p>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Certificados</h2>
              <p className="text-gray-300">
                Em breve: Seus certificados de conclusão
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
