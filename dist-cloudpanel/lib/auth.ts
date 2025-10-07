import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
// Use NextAuth Prisma Adapter package compatible with next-auth types
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
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
      if (session.user) {
        // Para credenciais, os dados já vêm do token
        if (token) {
          session.user.id = token.id as string
          session.user.role = token.role as string
          session.user.escudos = token.escudos as number
          session.user.subscriptionStatus = token.subscriptionStatus as string
          session.user.subscriptionPlan = token.subscriptionPlan as string
        } else {
          // Para OAuth, buscar no banco
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              escudos: true,
              subscriptionStatus: true,
              subscriptionPlan: true,
            },
          })

          if (dbUser) {
            session.user.id = dbUser.id
            session.user.role = dbUser.role
            session.user.escudos = dbUser.escudos
            session.user.subscriptionStatus = dbUser.subscriptionStatus
            session.user.subscriptionPlan = dbUser.subscriptionPlan
          }
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as any
        token.id = u.id
        token.role = u.role
        token.escudos = u.escudos
        token.subscriptionStatus = u.subscriptionStatus
        token.subscriptionPlan = u.subscriptionPlan
      }
      return token
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists by email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            // Create new user
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: 'STUDENT',
                escudos: 0,
                subscriptionStatus: 'INACTIVE',
              },
            })
          } else {
            // Update existing user with Google account info
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name,
                image: user.image,
              },
            })
          }
        } catch (error) {
          console.error('Error handling user sign in:', error)
          return false
        }
      }
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
