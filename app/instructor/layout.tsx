'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpenIcon,
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PuzzlePieceIcon,
  FlagIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/instructor',
      icon: HomeIcon,
      current: pathname === '/instructor'
    },
    {
      name: 'Meus Cursos',
      href: '/instructor/courses',
      icon: BookOpenIcon,
      current: pathname.startsWith('/instructor/courses')
    },
    {
      name: 'Criar Curso',
      href: '/instructor/courses/new',
      icon: AcademicCapIcon,
      current: pathname === '/instructor/courses/new'
    },
    {
      name: 'Módulos',
      href: '/instructor/modules',
      icon: DocumentTextIcon,
      current: pathname.startsWith('/instructor/modules')
    },
    {
      name: 'Aulas',
      href: '/instructor/lessons',
      icon: VideoCameraIcon,
      current: pathname.startsWith('/instructor/lessons')
    },
    {
      name: 'CTFs',
      href: '/instructor/ctfs',
      icon: PuzzlePieceIcon,
      current: pathname.startsWith('/instructor/ctfs')
    },
    {
      name: 'Certificados',
      href: '/instructor/certificates',
      icon: FlagIcon,
      current: pathname.startsWith('/instructor/certificates')
    },
    {
      name: 'Analytics',
      href: '/instructor/analytics',
      icon: ChartBarIcon,
      current: pathname.startsWith('/instructor/analytics')
    },
    {
      name: 'Alunos',
      href: '/instructor/students',
      icon: UsersIcon,
      current: pathname.startsWith('/instructor/students')
    },
    {
      name: 'Configurações',
      href: '/instructor/settings',
      icon: CogIcon,
      current: pathname.startsWith('/instructor/settings')
    }
  ]

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  if ((session.user as any)?.role !== 'INSTRUCTOR') {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-75" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 lg:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <BookOpenIcon className="h-8 w-8 text-blue-400" />
                  <span className="text-xl font-bold text-white">Instrutor</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    {item.name}
                  </a>
                ))}
              </nav>

              {/* User info and logout */}
              <div className="border-t border-slate-700 p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {session.user?.name?.charAt(0) || 'I'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {session.user?.name || 'Instrutor'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                  Sair
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-slate-800 border-r border-slate-700">
          {/* Header */}
          <div className="flex h-16 items-center px-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <BookOpenIcon className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Instrutor</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}
                />
                {item.name}
              </a>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-medium">
                  {session.user?.name?.charAt(0) || 'I'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {session.user?.name || 'Instrutor'}
                </p>
                <p className="text-xs text-gray-400">
                  {session.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex h-16 items-center justify-between px-4 bg-slate-800 border-b border-slate-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">Instrutor</span>
          </div>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
