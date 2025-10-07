'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
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
import { Course } from '@/types'
import toast from 'react-hot-toast'

interface InstructorCourseCardProps {
  course: Course
  onDelete: (courseId: string) => void
  onEdit: (courseId: string) => void
  onManage: (courseId: string) => void
}

export default function InstructorCourseCard({ 
  course, 
  onDelete, 
  onEdit, 
  onManage 
}: InstructorCourseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return
    
    setIsDeleting(true)
    try {
      await onDelete(course.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      key={course.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors overflow-hidden border border-slate-700"
    >
      {/* Cover Image */}
      {course.coverImage ? (
        <div className="relative h-40 w-full bg-slate-900">
          <img
            src={course.coverImage}
            alt={course.title}
            className="h-40 w-full object-cover"
          />
          {/* Combined status badge */}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-black/60 text-white border border-white/10">
              {(course as any).status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
              {' '}
              ({(course as any).approvalStatus === 'APPROVED' ? 'Aprovado' : (course as any).approvalStatus === 'REJECTED' ? 'Rejeitado' : 'Pendente'})
            </span>
          </div>
        </div>
      ) : null}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-gray-300 text-sm line-clamp-2">
              {course.shortDescription || course.description}
            </p>
          </div>
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{course.duration}h</span>
          </div>
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span>0 inscritos</span>
          </div>
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
            <span>0</span>
          </div>
        </div>

        {/* Price and Escudos */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white">
              R$ {course.price.toFixed(2)}
            </span>
            <span className="text-yellow-400 text-sm font-medium">
              {course.escudosPrice} Escudos
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onEdit(course.id)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Editar
          </button>
          
          <button
            onClick={() => onManage(course.id)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
            Gerenciar
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
