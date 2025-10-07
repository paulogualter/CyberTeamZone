'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import AdminDashboard from '@/components/AdminDashboard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useUserStatus } from '@/hooks/useUserStatus'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const { userStatus, isLoading: userStatusLoading, isAdmin } = useUserStatus()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading' || userStatusLoading) return

    // Se não há sessão mas há dados do usuário (usuário logado via OAuth mas sessão vazia)
    if (!session && userStatus) {
      console.log('🔍 Admin page: User logged in via OAuth but session empty, checking user status:', userStatus)
      
      if (isAdmin) {
        console.log('🔑 Admin user confirmed, showing admin page')
        setIsLoading(false)
        return
      } else {
        console.log('❌ User is not admin, redirecting to dashboard')
        router.push('/dashboard')
        return
      }
    }
    
    // Lógica original para usuários com sessão válida
    if (session) {
      if (!session) {
        router.push('/auth/signin')
        return
      }

      if (session.user?.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }

      setIsLoading(false)
    } else if (!userStatus) {
      // Se não há sessão nem dados do usuário, redirecionar para login
      console.log('🔍 No session and no user status, redirecting to login')
      router.push('/auth/signin')
      return
    }
  }, [session, status, userStatus, userStatusLoading, isAdmin, router])

  if (status === 'loading' || userStatusLoading || isLoading) {
    return <LoadingSpinner />
  }

  // Permitir acesso se é admin (via sessão ou dados do usuário)
  const canAccess = (session?.user?.role === 'ADMIN') || isAdmin
  
  if (!canAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </main>
    </div>
  )
}
