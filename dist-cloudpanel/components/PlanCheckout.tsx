'use client'

import { useState } from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Plan {
  id: string
  name: string
  price: number
  escudos: number
  description: string
  features: string[]
  popular?: boolean
  color: string
}

interface PlanCheckoutProps {
  plan: Plan
  onSuccess?: () => void
  onError?: (error: string) => void
  onCancel?: () => void
}

export default function PlanCheckout({ plan, onSuccess, onError, onCancel }: PlanCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'subscription',
          planId: plan.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar checkout')
      }

      // Redirecionar para o Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-500 bg-blue-500/10'
      case 'yellow':
        return 'border-yellow-500 bg-yellow-500/10'
      case 'purple':
        return 'border-purple-500 bg-purple-500/10'
      default:
        return 'border-gray-500 bg-gray-500/10'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" style={{ zIndex: 9999 }}>
      <div className="bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Confirmar Assinatura</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="p-6">
          <div className={`border-2 rounded-lg p-6 ${getColorClasses(plan.color)}`}>
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <p className="text-gray-300 text-sm mt-1">{plan.description}</p>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-white">
                R$ {plan.price.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-gray-400 text-sm">por mês</div>
              <div className="text-green-400 text-sm font-medium mt-1">
                {plan.escudos} escudos mensais
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <h4 className="text-white font-semibold mb-2">Resumo do Pagamento</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Plano {plan.name}</span>
                <span className="text-white">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Escudos incluídos</span>
                <span className="text-green-400">{plan.escudos} escudos</span>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total mensal</span>
                  <span className="text-white">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Processando...' : 'Assinar Agora'}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Você será redirecionado para o Stripe para finalizar o pagamento
          </p>
        </div>
      </div>
    </div>
  )
}
