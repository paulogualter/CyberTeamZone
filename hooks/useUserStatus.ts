'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UserStatus {
  id: string
  email: string
  name: string
  role: string
  subscriptionStatus: string
  subscriptionPlan: string | null
  escudos: number
}

export function useUserStatus() {
  const { data: session, status } = useSession()
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUserStatus = async () => {
      if (status === 'loading') return

      // Se há sessão válida, usar dados da sessão
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setUserStatus({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role || 'STUDENT',
                subscriptionStatus: data.user.subscriptionStatus || 'INACTIVE',
                subscriptionPlan: data.user.subscriptionPlan,
                escudos: data.user.escudos || 0
              })
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        // Se não há sessão, não tentar verificar dados do usuário
        console.log('🔍 No session, skipping user status check')
      }
      
      setIsLoading(false)
    }

    checkUserStatus()
  }, [session, status])

  return {
    userStatus,
    isLoading: isLoading || status === 'loading',
    isAdmin: userStatus?.role === 'ADMIN',
    hasActiveSubscription: userStatus?.subscriptionStatus === 'ACTIVE',
    escudos: userStatus?.escudos || 0
  }
}
