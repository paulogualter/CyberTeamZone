'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserEscudos } from '@/hooks/useUserEscudos'

export default function Header() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { escudos: userEscudos, refreshEscudos } = useUserEscudos()

  // Use session data only
  const currentUser = session?.user
  const userRole = (session?.user as any)?.role || 'USER'
  const subscriptionStatus = (session?.user as any)?.subscriptionStatus || 'INACTIVE'

  // Navigation based on subscription status
  const getNavigation = () => {
    if (!currentUser) {
      return [{ name: 'Catalog', href: '/' }]
    }
    
    // If user has active subscription or is admin/instructor, show full menu
    if (subscriptionStatus === 'ACTIVE' || userRole === 'ADMIN' || userRole === 'INSTRUCTOR') {
      const baseMenu = [
        { name: 'Catalog', href: '/' },
        { name: 'My Courses', href: '/member/courses' },
        { name: 'CTF', href: '/ctf' },
        { name: 'Community', href: '/community' },
        { name: 'Certificates', href: '/certificates' },
      ]
      
      // Add admin-specific menu items
      if (userRole === 'ADMIN') {
        baseMenu.push({ name: 'Admin Panel', href: '/admin' })
      }
      
      return baseMenu
    }
    
    // If user is logged in but doesn't have active subscription, show only catalog
    return [{ name: 'Catalog', href: '/' }]
  }

  const navigation = getNavigation()

  // Header for non-logged users
  if (!currentUser) {
    return (
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-orange-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-white">CyberTeam</span>
            </Link>

            {/* Desktop Navigation - Only Catalog for non-logged users */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth/signup')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-orange-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold text-white">CyberTeam</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-700 h-8 w-8 rounded-full"></div>
            ) : currentUser ? (
              <div className="flex items-center space-x-4">
                {/* Escudos Display */}
                <div className="flex items-center space-x-1 bg-orange-600/20 px-3 py-1 rounded-full">
                  <CurrencyDollarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">
                    {userEscudos}
                  </span>
                </div>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                    <UserCircleIcon className="h-8 w-8" />
                    <span>{currentUser?.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                      >
                        Settings
                      </Link>
                      {userRole === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                        >
                          Administration
                        </Link>
                      )}
            <Link
              href="/admin/notifications"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
            >
              Notifications
            </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-blue-500/20"
            >
              <nav className="py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {currentUser ? (
                  <div className="pt-4 border-t border-gray-700">
                    <div className="px-4 py-2">
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>{userEscudos} Shields</span>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/' })
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={() => {
                        router.push('/auth/signin')
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
