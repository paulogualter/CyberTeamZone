import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email.trim().toLowerCase()

        const { data: user, error } = await supabaseAdmin
          .from('User')
          .select('*')
          .eq('email', email)
          .single()

        if (error || !user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          escudos: user.escudos,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionPlan: user.subscriptionPlan,
        }
      }
    }),
  ],
  callbacks: {
        async session({ session, user, token }) {
          console.log('🔍 Debug: Session callback triggered')
          console.log('📋 Session data:', { user: session.user, hasToken: !!token })
          
          if (session.user) {
            // Para credenciais, os dados já vêm do token
            if (token) {
              console.log('🔑 Using token data for session')
              session.user.id = token.id as string
              session.user.role = token.role as string
              session.user.escudos = token.escudos as number
              session.user.subscriptionStatus = token.subscriptionStatus as string
              session.user.subscriptionPlan = token.subscriptionPlan as string
            } else {
              // Para OAuth, buscar no banco
              console.log('🔍 Debug: Fetching user from database for OAuth session')
              const { data: dbUser, error: dbError } = await supabaseAdmin
                .from('User')
                .select('id, name, email, image, role, escudos, subscriptionStatus, subscriptionPlan')
                .eq('email', session.user.email!)
                .single()

              console.log('📋 Database user query result:', { dbUser, dbError })

              if (dbUser) {
                console.log('✅ User found in database, updating session')
                session.user.id = dbUser.id
                session.user.role = dbUser.role
                session.user.escudos = dbUser.escudos
                session.user.subscriptionStatus = dbUser.subscriptionStatus
                session.user.subscriptionPlan = dbUser.subscriptionPlan
              } else {
                console.log('❌ User not found in database during session callback')
                console.log('👤 User data:', { email: session.user.email, name: session.user.name })
              }
            }
          }
          
          console.log('📋 Final session data:', session)
          return session
        },
    async jwt({ token, user, account }) {
      console.log('🔍 Debug: JWT callback triggered')
      console.log('📋 JWT data:', { hasUser: !!user, hasAccount: !!account, tokenKeys: Object.keys(token) })
      
      if (user) {
        const u = user as any
        token.id = u.id
        token.role = u.role
        token.escudos = u.escudos
        token.subscriptionStatus = u.subscriptionStatus
        token.subscriptionPlan = u.subscriptionPlan
        console.log('✅ Token updated with user data:', { id: token.id, role: token.role, escudos: token.escudos })
        
        // Se é um login OAuth, salvar dados
        if (account?.provider && ['google', 'apple', 'microsoft'].includes(account.provider)) {
          console.log('🔍 Debug: OAuth login detected in JWT callback')
          console.log('👤 User data:', { email: user.email, name: user.name })
          console.log('🔑 Account data:', { provider: account.provider, type: account.type })
          
          try {
            // 1. Verificar se o usuário já existe
            const { data: existingUser, error: fetchError } = await supabaseAdmin
              .from('User')
              .select('id')
              .eq('email', user.email!)
              .single()

            console.log('🔍 Debug: Existing user check:', { existingUser, fetchError })

            let userId: string

            if (!existingUser) {
              console.log('➕ Creating new user in Supabase...')
              const now = new Date().toISOString()
              userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              
              const { data: newUser, error: insertError } = await supabaseAdmin
                .from('User')
                .insert({
                  id: userId,
                  email: user.email!,
                  name: user.name,
                  image: user.image,
                  role: 'STUDENT',
                  escudos: 0,
                  subscriptionStatus: 'INACTIVE',
                  emailVerified: now,
                  isActive: true,
                  createdAt: now,
                  updatedAt: now,
                })
                .select()
                .single()

              if (insertError) {
                console.error('❌ Error creating user:', insertError)
              } else {
                console.log('✅ User created successfully:', newUser)
                token.id = newUser.id
              }
            } else {
              userId = existingUser.id
              console.log('🔄 Updating existing user...')
              const { error: updateError } = await supabaseAdmin
                .from('User')
                .update({
                  name: user.name,
                  image: user.image,
                })
                .eq('email', user.email!)

              if (updateError) {
                console.error('❌ Error updating user:', updateError)
              } else {
                console.log('✅ User updated successfully')
              }
            }

            // 2. Criar/atualizar conta OAuth na tabela Account
            console.log('🔐 Creating/updating OAuth account...')
            const accountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            const { data: existingAccount, error: accountFetchError } = await supabaseAdmin
              .from('Account')
              .select('id')
              .eq('provider', account.provider)
              .eq('providerAccountId', account.providerAccountId)
              .single()

            if (!existingAccount) {
              console.log('➕ Creating new OAuth account...')
              const { data: newAccount, error: accountInsertError } = await supabaseAdmin
                .from('Account')
                .insert({
                  id: accountId,
                  userId: userId,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                })
                .select()
                .single()

              if (accountInsertError) {
                console.error('❌ Error creating OAuth account:', accountInsertError)
              } else {
                console.log('✅ OAuth account created successfully:', newAccount)
              }
            } else {
              console.log('🔄 Updating existing OAuth account...')
              const { error: accountUpdateError } = await supabaseAdmin
                .from('Account')
                .update({
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                })
                .eq('provider', account.provider)
                .eq('providerAccountId', account.providerAccountId)

              if (accountUpdateError) {
                console.error('❌ Error updating OAuth account:', accountUpdateError)
              } else {
                console.log('✅ OAuth account updated successfully')
              }
            }

          } catch (error) {
            console.error('❌ Error handling OAuth login in JWT callback:', error)
          }
          
          // Buscar dados atualizados do usuário no banco para atualizar o token
          try {
            const { data: dbUser, error: fetchError } = await supabaseAdmin
              .from('User')
              .select('id, name, email, role, escudos, subscriptionStatus, subscriptionPlan')
              .eq('email', user.email!)
              .single()
            
            if (dbUser && !fetchError) {
              console.log('🔄 Updating token with database data:', dbUser)
              token.id = dbUser.id
              token.role = dbUser.role
              token.escudos = dbUser.escudos
              token.subscriptionStatus = dbUser.subscriptionStatus
              token.subscriptionPlan = dbUser.subscriptionPlan
                 // Ensure Instructor row exists when role is INSTRUCTOR
                 try {
                   if (dbUser.role === 'INSTRUCTOR') {
                     const { data: existingInstructor } = await supabaseAdmin
                       .from('Instructor')
                       .select('id')
                       .eq('email', dbUser.email)
                       .maybeSingle()
                     if (!existingInstructor) {
                       await supabaseAdmin
                         .from('Instructor')
                         .insert({
                           name: dbUser.name || 'Instrutor',
                           email: dbUser.email,
                           bio: 'Instrutor do CyberTeam',
                           avatar: null,
                           expertise: JSON.stringify(['Cibersegurança']),
                           socialLinks: JSON.stringify({}),
                           isActive: true,
                         })
                     }
                   }
                 } catch (e) {
                   console.log('⚠️ Instructor sync on login skipped:', e)
                 }
              console.log('✅ Token updated with database data:', { id: token.id, role: token.role, escudos: token.escudos })
            } else {
              console.log('❌ Could not fetch user data for token update:', fetchError)
            }
          } catch (error) {
            console.error('❌ Error fetching user data for token update:', error)
          }
        }
      } else if (account) {
        // Para OAuth sem user (refresh token), buscar dados do usuário no banco
        console.log('🔍 OAuth refresh detected in JWT, fetching user from database')
        try {
          const { data: dbUser, error } = await supabaseAdmin
            .from('User')
            .select('id, name, email, role, escudos, subscriptionStatus, subscriptionPlan')
            .eq('email', token.email)
            .single()
          
          if (dbUser) {
            console.log('✅ User found in JWT refresh callback:', dbUser)
            token.id = dbUser.id
            token.role = dbUser.role
            token.escudos = dbUser.escudos
            token.subscriptionStatus = dbUser.subscriptionStatus
            token.subscriptionPlan = dbUser.subscriptionPlan
          } else {
            console.log('❌ User not found in JWT refresh callback')
          }
        } catch (error) {
          console.error('❌ Error fetching user in JWT refresh callback:', error)
        }
      }
      
      console.log('📋 Final token data:', { id: token.id, role: token.role, escudos: token.escudos })
      return token
    },
    async signIn({ user, account, profile }) {
      console.log('🔍 Debug: signIn callback triggered for provider:', account?.provider)
      console.log('👤 User data:', { email: user.email, name: user.name })
      console.log('🔑 Account data:', { provider: account?.provider, type: account?.type })
      
      // Processar todos os providers OAuth, não apenas Google
      if (account?.provider && ['google', 'apple', 'microsoft'].includes(account.provider)) {
        try {
          console.log(`🔍 Debug: ${account.provider} sign in callback triggered`)
          console.log('👤 User data:', { email: user.email, name: user.name })
          
          // 1. Verificar se o usuário já existe
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('User')
            .select('id')
            .eq('email', user.email!)
            .single()

          console.log('🔍 Debug: Existing user check:', { existingUser, fetchError })

          let userId: string

          if (!existingUser) {
            console.log('➕ Creating new user in Supabase...')
            const now = new Date().toISOString()
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            // Determinar papel baseado no email (usando variáveis de ambiente)
            let userRole = 'STUDENT'
            const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
            if (adminEmails.includes(user.email!)) {
              userRole = 'ADMIN'
              console.log('🔑 Admin user detected via OAuth:', user.email)
            }

            const { data: newUser, error: insertError } = await supabaseAdmin
              .from('User')
              .insert({
                id: userId,
                email: user.email!,
                name: user.name,
                image: user.image,
                role: userRole,
                escudos: 0,
                subscriptionStatus: 'INACTIVE',
                emailVerified: now,
                isActive: true,
                createdAt: now,
                updatedAt: now,
              })
              .select()
              .single()

            if (insertError) {
              console.error('❌ Error creating user:', insertError)
              return false
            }
            console.log('✅ User created successfully:', newUser)
          } else {
            userId = existingUser.id
            console.log('🔄 Updating existing user...')
            
            // Verificar se precisa promover para ADMIN
            const { data: currentUser } = await supabaseAdmin
              .from('User')
              .select('role')
              .eq('email', user.email!)
              .single()
            
            let updateData: any = {
              name: user.name,
              image: user.image,
            }
            
            // Promover para ADMIN se estiver na lista de emails autorizados
            const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
            if (adminEmails.includes(user.email!) && currentUser?.role !== 'ADMIN') {
              updateData.role = 'ADMIN'
              console.log('🔑 Promoting existing user to ADMIN:', user.email)
            }
            
            const { error: updateError } = await supabaseAdmin
              .from('User')
              .update(updateData)
              .eq('email', user.email!)

            if (updateError) {
              console.error('❌ Error updating user:', updateError)
              return false
            }
            console.log('✅ User updated successfully')
          }

          // 2. Criar/atualizar conta OAuth na tabela Account
          console.log('🔐 Creating/updating OAuth account...')
          const accountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          const { data: existingAccount, error: accountFetchError } = await supabaseAdmin
            .from('Account')
            .select('id')
            .eq('provider', account.provider)
            .eq('providerAccountId', account.providerAccountId)
            .single()

          if (!existingAccount) {
            console.log('➕ Creating new OAuth account...')
            const { data: newAccount, error: accountInsertError } = await supabaseAdmin
              .from('Account')
              .insert({
                id: accountId,
                userId: userId,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              })
              .select()
              .single()

            if (accountInsertError) {
              console.error('❌ Error creating OAuth account:', accountInsertError)
              return false
            }
            console.log('✅ OAuth account created successfully:', newAccount)
          } else {
            console.log('🔄 Updating existing OAuth account...')
            const { error: accountUpdateError } = await supabaseAdmin
              .from('Account')
              .update({
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              })
              .eq('provider', account.provider)
              .eq('providerAccountId', account.providerAccountId)

            if (accountUpdateError) {
              console.error('❌ Error updating OAuth account:', accountUpdateError)
              return false
            }
            console.log('✅ OAuth account updated successfully')
          }

        } catch (error) {
          console.error('❌ Error handling user sign in:', error)
          return false
        }
      }
      
      console.log('✅ SignIn callback completed successfully')
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      escudos: number
      subscriptionStatus: string
      subscriptionPlan?: string | null
    }
  }
}
