'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useOAuthAccount() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Verificar se é um login OAuth (não tem token.id, significa que veio do OAuth)
      const isOAuthLogin = !session.user.id || session.user.id.startsWith('user_')
      
      if (isOAuthLogin) {
        console.log('🔍 Debug: OAuth login detected, handling login')
        
        // Chamar endpoint para lidar com login OAuth
        fetch('/api/oauth/handle-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('✅ OAuth login handled successfully')
          } else {
            console.error('❌ Error handling OAuth login:', data.error)
          }
        })
        .catch(error => {
          console.error('❌ Error handling OAuth login:', error)
        })
      }
    }
  }, [session, status])

  return { session, status }
}
