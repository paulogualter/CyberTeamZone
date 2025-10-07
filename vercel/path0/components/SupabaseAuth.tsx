'use client'

import { useState, useEffect } from 'react'
import { supabaseAuth } from '@/lib/supabase-auth'
import { User } from '@supabase/supabase-js'

export default function SupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      const { data: { session } } = await supabaseAuth.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 Supabase Auth Event:', event)
        console.log('👤 User:', session?.user)
        
        setUser(session?.user ?? null)
        setLoading(false)

        // Se é um login OAuth, salvar dados na tabela User
        if (event === 'SIGNED_IN' && session?.user) {
          await saveUserToDatabase(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const saveUserToDatabase = async (user: User) => {
    try {
      console.log('🔍 Saving OAuth user to database:', user.email)
      
      // Verificar se o usuário já existe
      const { data: existingUser, error: fetchError } = await supabaseAuth
        .from('User')
        .select('id')
        .eq('email', user.email!)
        .single()

      if (existingUser) {
        console.log('🔄 User already exists, updating...')
        const { error: updateError } = await supabaseAuth
          .from('User')
          .update({
            name: user.user_metadata?.full_name || user.user_metadata?.name,
            image: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            emailVerified: user.email_confirmed_at,
          })
          .eq('email', user.email!)

        if (updateError) {
          console.error('❌ Error updating user:', updateError)
        } else {
          console.log('✅ User updated successfully')
        }
      } else {
        console.log('➕ Creating new OAuth user...')
        const { data: newUser, error: insertError } = await supabaseAuth
          .from('User')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name,
            image: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            role: 'STUDENT',
            escudos: 0,
            subscriptionStatus: 'INACTIVE',
            emailVerified: user.email_confirmed_at,
            isActive: true,
            createdAt: user.created_at,
            updatedAt: user.updated_at || user.created_at,
          })
          .select()
          .single()

        if (insertError) {
          console.error('❌ Error creating user:', insertError)
        } else {
          console.log('✅ OAuth user created successfully:', newUser)
        }
      }
    } catch (error) {
      console.error('❌ Error saving user to database:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('🔍 Initiating Google OAuth...')
      
      const { data, error } = await supabaseAuth.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('❌ Error signing in with Google:', error)
        alert(`OAuth Error: ${error.message}`)
      } else {
        console.log('🔍 Google OAuth initiated:', data)
      }
    } catch (error) {
      console.error('❌ Error initiating Google OAuth:', error)
      alert(`OAuth Error: ${error}`)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabaseAuth.auth.signOut()
      if (error) {
        console.error('❌ Error signing out:', error)
      } else {
        console.log('✅ Signed out successfully')
      }
    } catch (error) {
      console.error('❌ Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-white">
          <p>Welcome, {user.user_metadata?.full_name || user.email}!</p>
          <p className="text-sm text-gray-300">ID: {user.id}</p>
        </div>
        <button
          onClick={signOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold text-white mb-4">Sign In with Supabase OAuth</h2>
      <button
        onClick={signInWithGoogle}
        className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>
    </div>
  )
}
