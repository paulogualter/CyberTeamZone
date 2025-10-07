'use client'

import { motion } from 'framer-motion'

interface CourseTypeBadgeProps {
  courseType: 'RECORDED' | 'ONLINE' | 'HYBRID'
  size?: 'sm' | 'md' | 'lg'
}

const courseTypeConfig = {
  RECORDED: {
    label: 'Gravado',
    icon: '🎥',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    darkColor: 'bg-blue-900/20 text-blue-300 border-blue-700'
  },
  ONLINE: {
    label: 'On-line',
    icon: '💻',
    color: 'bg-green-100 text-green-800 border-green-200',
    darkColor: 'bg-green-900/20 text-green-300 border-green-700'
  },
  HYBRID: {
    label: 'Híbrido',
    icon: '🔄',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    darkColor: 'bg-purple-900/20 text-purple-300 border-purple-700'
  }
}

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

export default function CourseTypeBadge({ courseType, size = 'sm' }: CourseTypeBadgeProps) {
  const config = courseTypeConfig[courseType]
  const sizeClasses = sizeConfig[size]

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${config.color} dark:${config.darkColor}
        ${sizeClasses}
      `}
    >
      <span className="text-xs">{config.icon}</span>
      <span>{config.label}</span>
    </motion.span>
  )
}
