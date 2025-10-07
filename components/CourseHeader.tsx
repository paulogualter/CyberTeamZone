'use client'

import { useState } from 'react'
import { 
  Cog6ToothIcon,
  UserCircleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'

interface CourseHeaderProps {
  courseTitle: string
  currentLessonTitle: string
  onMenuToggle: () => void
  onSettingsClick: () => void
  onLogout: () => void
  userName?: string
  escudos?: number
  planName?: string
}

export default function CourseHeader({
  courseTitle,
  currentLessonTitle,
  onMenuToggle,
  onSettingsClick,
  onLogout,
  userName = 'Usuário',
  escudos = 0,
  planName = 'Básico'
}: CourseHeaderProps) {

  return (
    <div className="bg-blue-600 px-6 py-4 flex items-center justify-between shadow-lg">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Bars3Icon className="h-6 w-6 text-white" />
        </button>
        
        <div className="text-2xl font-bold text-white">
          CyberTeam.Zone
        </div>
        
        <div className="hidden md:block text-sm text-blue-100 bg-blue-700 px-3 py-1 rounded-full">
          {courseTitle} / {currentLessonTitle}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">

        {/* Settings */}
        <button 
          onClick={onSettingsClick}
          className="p-2 hover:bg-blue-700 rounded-full transition-colors"
        >
          <Cog6ToothIcon className="h-5 w-5 text-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-4">
          {/* Escudos */}
          <div className="hidden md:flex items-center space-x-2 bg-blue-700 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm font-medium text-white">{escudos} Escudos</span>
          </div>
          
          {/* Plano */}
          <div className="hidden lg:flex items-center space-x-2 bg-blue-700 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-white">Plano {planName}</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-white">
                {userName}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
            title="Sair da área de membros"
          >
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
