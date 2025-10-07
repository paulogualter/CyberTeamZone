'use client'

import { useOAuthAccount } from '@/hooks/useOAuthAccount'

export default function OAuthHandler() {
  useOAuthAccount()
  return null // Este componente não renderiza nada, apenas executa o hook
}
