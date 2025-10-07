'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useSubscriptionStatus() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Administradores e instrutores não precisam de assinatura
    if (session.user.role === 'ADMIN' || session.user.role === 'INSTRUCTOR') {
      setIsLoading(false)
      return
    }

    // Verificar status da assinatura
    const userSubscriptionStatus = (session.user as any)?.subscriptionStatus || 'INACTIVE'
    setSubscriptionStatus(userSubscriptionStatus)

    // Se não tem assinatura ativa, redirecionar para planos (exceto admin/instrutor)
    if (userSubscriptionStatus !== 'ACTIVE' && session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') {
      router.push('/plans')
      return
    }

    setIsLoading(false)
  }, [session, status, router])

  return {
    isLoading,
    subscriptionStatus,
    user: session?.user
  }
}

// Hook para verificar se o usuário pode acessar uma rota específica
export function useRouteAccess() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [canAccess, setCanAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      setCanAccess(false)
      setIsLoading(false)
      return
    }

    // Administradores e instrutores podem acessar tudo
    if (session.user.role === 'ADMIN' || session.user.role === 'INSTRUCTOR') {
      setCanAccess(true)
      setIsLoading(false)
      return
    }

    // Verificar status da assinatura
    const userSubscriptionStatus = (session.user as any)?.subscriptionStatus || 'INACTIVE'
    
    if (userSubscriptionStatus === 'ACTIVE' || session.user.role === 'ADMIN' || session.user.role === 'INSTRUCTOR') {
      setCanAccess(true)
    } else {
      setCanAccess(false)
      router.push('/plans')
    }

    setIsLoading(false)
  }, [session, status, router])

  return {
    canAccess,
    isLoading,
    user: session?.user
  }
}
