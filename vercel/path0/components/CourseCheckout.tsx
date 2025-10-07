'use client'

import { useState, useEffect } from 'react'
import { CheckIcon, XMarkIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { getUserValidEscudos } from '@/lib/escudos'

interface Course {
  id: string
  title: string
  price: number
  escudosPrice: number
  shortDescription?: string
  coverImage?: string
}

interface CourseCheckoutProps {
  course: Course
  onSuccess?: () => void
  onError?: (error: string) => void
  onCancel?: () => void
}

export default function CourseCheckout({ course, onSuccess, onError, onCancel }: CourseCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEscudos, setUserEscudos] = useState(0)
  const [escudosToUse, setEscudosToUse] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'checkout'>('checkout')

  // Calcular limites
  const maxEscudosAllowed = Math.floor(course.price * 0.30) // 30% máximo
  const remainingAmount = Math.max(0, course.price - escudosToUse)

  useEffect(() => {
    fetchUserEscudos()
  }, [])

  const fetchUserEscudos = async () => {
    try {
      const response = await fetch('/api/user/escudos')
      const data = await response.json()
      
      if (data.success) {
        setUserEscudos(data.totalValidEscudos)
        // Definir escudos iniciais (máximo possível ou disponível)
        const initialEscudos = Math.min(maxEscudosAllowed, data.totalValidEscudos)
        setEscudosToUse(initialEscudos)
      }
    } catch (err) {
      console.error('Erro ao buscar escudos:', err)
    }
  }

  const handleEscudosChange = (value: number) => {
    const newValue = Math.min(value, maxEscudosAllowed, userEscudos)
    setEscudosToUse(newValue)
  }

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
          type: 'course',
          courseId: course.id,
          amount: course.price,
          escudosToUse: escudosToUse,
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

  const handleStripePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'course',
          courseId: course.id,
          amount: course.price,
          escudosToUse: escudosToUse,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }

      // Aqui você integraria com o componente StripePayment
      // Por enquanto, vamos usar o checkout
      handleCheckout()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Comprar Curso</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Course Info */}
          <div className="flex space-x-4 mb-6">
            {course.coverImage && (
              <img
                src={course.coverImage}
                alt={course.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{course.title}</h3>
              <p className="text-gray-300 text-sm mt-1">{course.shortDescription}</p>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">
                  R$ {course.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-gray-400 text-sm ml-2">
                  ou {course.escudosPrice} escudos
                </span>
              </div>
            </div>
          </div>

          {/* Escudos Section */}
          {userEscudos > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <h4 className="text-white font-semibold mb-3">Usar Escudos</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Seus escudos disponíveis:</span>
                  <span className="text-green-400 font-semibold">{userEscudos} escudos</span>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Quantos escudos usar (máximo {maxEscudosAllowed} - 30% do valor):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={Math.min(maxEscudosAllowed, userEscudos)}
                    value={escudosToUse}
                    onChange={(e) => handleEscudosChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="text-xs text-gray-400">
                  Você pode usar até {maxEscudosAllowed} escudos (30% do valor do curso)
                </div>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <h4 className="text-white font-semibold mb-3">Resumo do Pagamento</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Valor do curso</span>
                <span className="text-white">R$ {course.price.toFixed(2).replace('.', ',')}</span>
              </div>
              
              {escudosToUse > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Escudos utilizados</span>
                  <span className="text-green-400">-{escudosToUse} escudos</span>
                </div>
              )}
              
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Valor restante</span>
                  <span className="text-white">R$ {remainingAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {escudosToUse > 0 && (
                <div className="text-xs text-gray-400 mt-2">
                  Você ganhará {Math.floor(course.price)} escudos após a compra
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

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
              disabled={isLoading || remainingAmount <= 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <CreditCardIcon className="h-5 w-5" />
              <span>
                {isLoading ? 'Processando...' : `Pagar R$ ${remainingAmount.toFixed(2).replace('.', ',')}`}
              </span>
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Pagamento seguro processado pelo Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
