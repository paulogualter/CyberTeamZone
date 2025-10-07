'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Course } from '@/types'
import { StarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import CourseDetailModal from './CourseDetailModal'
import CourseTypeBadge from './CourseTypeBadge'

interface CourseCardProps {
  course: Course
  onClick: () => void
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isEnrolled, setIsEnrolled] = useState(false)

  // Use session data only
  const currentUser = session?.user
  const userRole = (session?.user as any)?.role || 'USER'
  const userEscudos = (session?.user as any)?.escudos || 0
  const userSubscription = (session?.user as any)?.subscriptionStatus || 'None'

  // Check if user is enrolled in this course
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!session?.user?.id) {
        setIsEnrolled(false)
        return
      }

      try {
        const response = await fetch(`/api/user/enrollments`)
        const data = await response.json()
        
        if (data.success) {
          const enrolledCourseIds = data.courses.map((c: any) => c.id)
          setIsEnrolled(enrolledCourseIds.includes(course.id))
        }
      } catch (error) {
        console.error('Error checking enrollment:', error)
        setIsEnrolled(false)
      }
    }

    checkEnrollment()
  }, [session?.user?.id, course.id])

  const handleVerCurso = () => {
    if (isEnrolled) {
      // Se o usuário está inscrito, vai direto para a área de membros
      router.push(`/member/course/${course.id}`)
    } else {
      // Se não está inscrito, chama a função onClick (modal de detalhes)
      onClick()
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED':
        return 'bg-red-100 text-red-800'
      case 'EXPERT':
        return 'bg-purple-100 text-purple-800'
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
      case 'EXPERT':
        return 'Expert'
      default:
        return difficulty
    }
  }

  const getCategoryNeonStyle = (categoryName: string) => {
    const category = categoryName?.toLowerCase() || ''
    
    switch (category) {
      case 'blue team defense':
        return {
          gradient: 'from-blue-500 to-blue-600',
          shadow: '0 0 20px rgba(59,130,246,0.4)',
          hoverShadow: '0 0 25px rgba(59,130,246,0.6)'
        }
      case 'cloud security':
        return {
          gradient: 'from-sky-500 to-sky-600',
          shadow: '0 0 20px rgba(14,165,233,0.4)',
          hoverShadow: '0 0 25px rgba(14,165,233,0.6)'
        }
      case 'compliance & governance':
        return {
          gradient: 'from-amber-500 to-amber-600',
          shadow: '0 0 20px rgba(245,158,11,0.4)',
          hoverShadow: '0 0 25px rgba(245,158,11,0.6)'
        }
      case 'cryptography':
        return {
          gradient: 'from-indigo-500 to-indigo-600',
          shadow: '0 0 20px rgba(99,102,241,0.4)',
          hoverShadow: '0 0 25px rgba(99,102,241,0.6)'
        }
      case 'digital forensics':
        return {
          gradient: 'from-teal-500 to-teal-600',
          shadow: '0 0 20px rgba(20,184,166,0.4)',
          hoverShadow: '0 0 25px rgba(20,184,166,0.6)'
        }
      case 'incident response':
        return {
          gradient: 'from-orange-500 to-orange-600',
          shadow: '0 0 20px rgba(249,115,22,0.4)',
          hoverShadow: '0 0 25px rgba(249,115,22,0.6)'
        }
      case 'iot security':
        return {
          gradient: 'from-emerald-500 to-emerald-600',
          shadow: '0 0 20px rgba(16,185,129,0.4)',
          hoverShadow: '0 0 25px rgba(16,185,129,0.6)'
        }
      case 'malware analysis':
        return {
          gradient: 'from-lime-500 to-lime-600',
          shadow: '0 0 20px rgba(132,204,22,0.4)',
          hoverShadow: '0 0 25px rgba(132,204,22,0.6)'
        }
      case 'mobile security':
        return {
          gradient: 'from-cyan-500 to-cyan-600',
          shadow: '0 0 20px rgba(6,182,212,0.4)',
          hoverShadow: '0 0 25px rgba(6,182,212,0.6)'
        }
      case 'network security':
        return {
          gradient: 'from-sky-500 to-blue-600',
          shadow: '0 0 20px rgba(0,127,255,0.4)',
          hoverShadow: '0 0 25px rgba(0,127,255,0.6)'
        }
      case 'penetration testing':
        return {
          gradient: 'from-red-500 to-red-600',
          shadow: '0 0 20px rgba(239,68,68,0.4)',
          hoverShadow: '0 0 25px rgba(239,68,68,0.6)'
        }
      case 'social engineering':
        return {
          gradient: 'from-yellow-500 to-yellow-600',
          shadow: '0 0 20px rgba(234,179,8,0.4)',
          hoverShadow: '0 0 25px rgba(234,179,8,0.6)'
        }
      case 'threat intelligence':
        return {
          gradient: 'from-purple-500 to-purple-600',
          shadow: '0 0 20px rgba(168,85,247,0.4)',
          hoverShadow: '0 0 25px rgba(168,85,247,0.6)'
        }
      case 'web application security':
        return {
          gradient: 'from-green-500 to-green-600',
          shadow: '0 0 20px rgba(34,197,94,0.4)',
          hoverShadow: '0 0 25px rgba(34,197,94,0.6)'
        }
      default:
        return {
          gradient: 'from-blue-500 to-purple-600',
          shadow: '0 0 20px rgba(59,130,246,0.3)',
          hoverShadow: '0 0 25px rgba(59,130,246,0.5)'
        }
    }
  }

  const neonStyle = getCategoryNeonStyle(course.category?.name || '')

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative rounded-xl p-[2px] bg-gradient-to-r ${neonStyle.gradient} transition-all duration-300`}
      style={{
        boxShadow: neonStyle.shadow,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = neonStyle.hoverShadow
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = neonStyle.shadow
      }}
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-[10px] overflow-hidden border border-slate-700 hover:border-slate-600 transition-all duration-300">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600">
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Image load error for:', course.coverImage);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-6xl">🛡️</div>
          </div>
        )}
        
        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
            {getDifficultyText(course.difficulty)}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
          {course.title}
        </h3>
        
        {/* Course Type Badge */}
        <div className="mb-3">
          <CourseTypeBadge courseType={course.courseType} size="sm" />
        </div>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {(course.shortDescription || course.description)?.substring(0, 50)}
          {(course.shortDescription || course.description)?.length > 50 && '...'}
        </p>

        {/* Instructor */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-medium">
              {course.instructor?.name?.charAt(0) || 'C'}
            </span>
          </div>
          <span className="text-gray-300 text-sm">{course.instructor?.name || 'CyberTeam'}</span>
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{course.duration}h</span>
          </div>
          <div className="flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            <span>{course.enrolledCount || 0} inscritos</span>
          </div>
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
            <span>{course.rating || 0}</span>
          </div>
        </div>

        {/* Start Date for Online/Hybrid Courses */}
        {(course.courseType === 'ONLINE' || course.courseType === 'HYBRID') && course.startDate && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center text-blue-300 text-sm">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Início: {new Date(course.startDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        )}

        {/* Price and Escudos */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">
              R$ {course.price.toFixed(2)}
            </span>
            <span className="text-yellow-400 text-sm font-medium">
              {course.escudosPrice} Escudos
            </span>
          </div>
        </div>

        {/* Action Button */}
        {userRole === 'INSTRUCTOR' ? (
          <div className="w-full py-3 px-4 rounded-lg bg-gray-600 text-gray-300 text-center font-medium">
            Instrutor - Acesso ao Catálogo
          </div>
        ) : (
          <button
            onClick={handleVerCurso}
            className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
              isEnrolled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isEnrolled ? 'Continuar Curso' : 'Ver Curso'}
          </button>
        )}
      </div>
      </div>
    </motion.div>
  )
}
