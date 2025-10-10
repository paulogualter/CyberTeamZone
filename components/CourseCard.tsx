'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Course } from '@/types'
import { StarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/solid'
import DebugCourseImage from './DebugCourseImage'
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


  // Check if course is Red Team Operations or Penetration Testing
  const isRedTeamCategory = course.category?.name?.toLowerCase() === 'red team operations' || 
                           course.category?.name?.toLowerCase() === 'penetration testing'

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative rounded-lg bg-slate-800/50 backdrop-blur-sm transition-all duration-300 overflow-hidden ${
        isRedTeamCategory 
          ? 'border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:shadow-[0_0_25px_rgba(239,68,68,0.8)] hover:border-red-400' 
          : 'border border-slate-700 hover:border-slate-600'
      }`}
    >
      {/* Course Image */}
      <div className="relative h-48">
        <DebugCourseImage
          src={course.coverImage}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        
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
    </motion.div>
  )
}
