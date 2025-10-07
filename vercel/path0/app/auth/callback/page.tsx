'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseAuth } from '@/lib/supabase-auth'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 Handling Supabase OAuth callback...')
        
        const { data, error } = await supabaseAuth.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
          router.push('/auth/signin?error=callback_error')
          return
        }

        if (data.session) {
          console.log('✅ OAuth callback successful, user:', data.session.user)
          router.push('/dashboard')
        } else {
          console.log('❌ No session found in callback')
          router.push('/auth/signin?error=no_session')
        }
      } catch (error) {
        console.error('❌ Error in auth callback:', error)
        router.push('/auth/signin?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-white text-xl mb-4">Processing OAuth callback...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  )
}
