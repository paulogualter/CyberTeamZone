'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Aguardar a sessão carregar completamente
    if (status === 'loading') return

    console.log('🔍 AdminRedirect - Current pathname:', pathname)
    console.log('🔍 AdminRedirect - Session user role:', session?.user?.role)

    // Não redirecionar em áreas de consumo de conteúdo (membros)
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/instructor') ||
      pathname.startsWith('/course') ||
      pathname.startsWith('/member')
    ) {
      console.log('✅ AdminRedirect - Path allowed, no redirect')
      return
    }

    // Permitir que admin acesse a página principal (catálogo)
    if (pathname === '/') {
      console.log('✅ AdminRedirect - Home page allowed, no redirect')
      return
    }

    // Se o usuário é ADMIN e não está na área administrativa, redirecionar
    if (session?.user?.role === 'ADMIN') {
      console.log('🔑 AdminRedirect - Admin user detected, redirecting to /admin')
      router.push('/admin')
    }
  }, [session, status, router, pathname])

  return null
}
