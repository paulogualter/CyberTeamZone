'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UsersIcon
} from '@heroicons/react/24/outline'

export default function InstructorStudents() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Page Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Alunos</h1>
            <p className="text-gray-300">Gerencie os alunos dos seus cursos</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Funcionalidade em desenvolvimento
          </h3>
          <p className="text-gray-400">
            Em breve você poderá gerenciar alunos aqui
          </p>
        </div>
      </div>
    </div>
  )
}
