'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'Esta conta já está vinculada a outro usuário. Tente fazer login com a conta original.'
      case 'OAuthSignin':
        return 'Erro ao fazer login com Google. Tente novamente.'
      case 'OAuthCallback':
        return 'Erro no callback do Google. Tente novamente.'
      case 'OAuthCreateAccount':
        return 'Erro ao criar conta. Tente novamente.'
      case 'EmailCreateAccount':
        return 'Erro ao criar conta com email. Tente novamente.'
      case 'Callback':
        return 'Erro no callback. Tente novamente.'
      case 'OAuthAccountNotLinked':
        return 'Esta conta já está vinculada a outro usuário.'
      case 'EmailSignin':
        return 'Erro ao fazer login com email. Tente novamente.'
      case 'CredentialsSignin':
        return 'Erro nas credenciais. Verifique seus dados.'
      case 'SessionRequired':
        return 'Sessão necessária. Faça login novamente.'
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex justify-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Erro de Autenticação
          </h2>
          <p className="mt-2 text-gray-300">
            {getErrorMessage(error)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-red-500/20"
        >
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">
                Código do erro: <span className="font-mono text-red-400">{error}</span>
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Tentar Novamente
              </Link>
              
              <Link
                href="/"
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-600 rounded-lg shadow-sm bg-slate-700 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-400 text-sm">
            Se o problema persistir, entre em contato com o suporte
          </p>
        </motion.div>
      </div>
    </div>
  )
}
