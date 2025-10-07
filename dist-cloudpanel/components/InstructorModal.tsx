'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  UserIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  StarIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { Instructor } from '@/types'

interface InstructorModalProps {
  instructor: Instructor
  isOpen: boolean
  onClose: () => void
}

export default function InstructorModal({ instructor, isOpen, onClose }: InstructorModalProps) {
  if (!isOpen) return null

  // Parse expertise and socialLinks from JSON if they exist
  const expertise = typeof instructor.expertise === 'string' 
    ? JSON.parse(instructor.expertise || '[]') 
    : instructor.expertise || []
  
  const socialLinks = typeof instructor.socialLinks === 'string' 
    ? JSON.parse(instructor.socialLinks || '{}') 
    : instructor.socialLinks || {}

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative p-8 border-b border-slate-700">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 bg-slate-700/50 hover:bg-slate-700 text-white p-2 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  {instructor.avatar ? (
                    <img
                      src={instructor.avatar}
                      alt={instructor.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {instructor.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{instructor.name}</h1>
                  <p className="text-xl text-gray-300 mb-4">{instructor.bio}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-400">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm">{instructor.email}</span>
                    </div>
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm">
                        {instructor.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Expertise */}
              {expertise && expertise.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-400" />
                    Especialidades
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {expertise.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-900/30 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio Details */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <UserIcon className="h-6 w-6 mr-2 text-green-400" />
                  Sobre o Instrutor
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {instructor.bio || 'Especialista em cibersegurança com vasta experiência em proteção de sistemas e análise de vulnerabilidades. Dedica-se ao ensino e compartilhamento de conhecimento na área de segurança da informação.'}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {socialLinks && Object.keys(socialLinks).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <GlobeAltIcon className="h-6 w-6 mr-2 text-purple-400" />
                    Redes Sociais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group"
                      >
                        <GlobeAltIcon className="h-5 w-5 text-gray-400 group-hover:text-white mr-3" />
                        <span className="text-gray-300 group-hover:text-white capitalize">
                          {platform}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-700/30 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpenIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">Cursos Ministrados</h4>
                  <p className="text-2xl font-bold text-blue-400">12+</p>
                </div>
                
                <div className="bg-slate-700/30 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserGroupIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">Alunos Formados</h4>
                  <p className="text-2xl font-bold text-green-400">2.5K+</p>
                </div>
                
                <div className="bg-slate-700/30 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <StarIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">Avaliação Média</h4>
                  <p className="text-2xl font-bold text-yellow-400">4.9</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
