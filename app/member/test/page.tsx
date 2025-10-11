'use client'

import { useSession } from 'next-auth/react'

export default function TestPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">🧪 Página de Teste</h1>
        <p className="text-xl mb-4">Se você está vendo esta página, a área de membros está funcionando!</p>
        <div className="bg-slate-800 p-6 rounded-lg">
          <p className="text-lg mb-2">Usuário: {session?.user?.name || 'Não logado'}</p>
          <p className="text-lg mb-2">Role: {session?.user?.role || 'N/A'}</p>
          <p className="text-lg">Email: {session?.user?.email || 'N/A'}</p>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Esta página não deveria redirecionar para /admin
        </p>
      </div>
    </div>
  )
}
