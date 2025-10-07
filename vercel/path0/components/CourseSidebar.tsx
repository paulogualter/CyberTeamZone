'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlayIcon, 
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Module, Lesson } from '@/types'

interface CourseSidebarProps {
  courseTitle: string
  modules: (Module & { lessons: Lesson[] })[]
  currentLessonId?: string
  progress: number
  userProgress?: any
  onLessonSelect: (lesson: Lesson) => void
  isOpen: boolean
  onClose: () => void
}

export default function CourseSidebar({
  courseTitle,
  modules,
  currentLessonId,
  progress,
  userProgress,
  onLessonSelect,
  isOpen,
  onClose
}: CourseSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.length > 0 ? [modules[0].id] : [])
  )

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const isLessonCompleted = (lessonId: string) => {
    if (!userProgress?.progressMap) return false
    return userProgress.progressMap[lessonId]?.completed || false
  }

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'VIDEO': return <PlayIcon className="h-4 w-4 text-blue-500" />
      case 'TEXT': return <BookOpenIcon className="h-4 w-4 text-green-500" />
      case 'QUIZ': return <BookOpenIcon className="h-4 w-4 text-purple-500" />
      case 'PRACTICAL': return <BookOpenIcon className="h-4 w-4 text-orange-500" />
      case 'CTF': return <BookOpenIcon className="h-4 w-4 text-red-500" />
      default: return <BookOpenIcon className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        className={`fixed lg:relative top-0 left-0 h-full w-80 bg-gray-800 z-50 lg:z-auto flex-shrink-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white truncate">{courseTitle}</h2>
              <button 
                onClick={onClose}
                className="lg:hidden p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">PROGRESSO</span>
                <span className="text-sm text-green-400 font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Modules and Lessons */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="bg-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 bg-gray-600 hover:bg-gray-500 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-white">
                      {moduleIndex + 1}. {module.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({module.lessons.length} aulas)
                    </span>
                  </div>
                  {expandedModules.has(module.id) ? (
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedModules.has(module.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <button
                            key={lesson.id}
                            onClick={() => onLessonSelect(lesson)}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                              currentLessonId === lesson.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'hover:bg-gray-600 text-gray-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2 flex-1">
                              {getLessonIcon(lesson.type)}
                              <span className="text-sm font-medium truncate">
                                {moduleIndex + 1}.{lessonIndex + 1}. {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {isLessonCompleted(lesson.id) && (
                                <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                              )}
                              <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-400">
                CyberTeam.Zone
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Plataforma de Cibersegurança
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
