'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripePaymentProps {
  type: 'subscription' | 'course'
  planId?: string
  courseId?: string
  amount?: number
  escudosToUse?: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

function PaymentForm({ 
  type, 
  planId, 
  courseId, 
  amount, 
  escudosToUse = 0, 
  onSuccess, 
  onError 
}: StripePaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?success=true&type=${type}`,
        },
      })

      if (error) {
        setError(error.message || 'Erro no pagamento')
        onError?.(error.message || 'Erro no pagamento')
      } else {
        onSuccess?.()
      }
    } catch (err) {
      const errorMessage = 'Erro inesperado no pagamento'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheckIcon className="h-6 w-6 text-green-500" />
          <h3 className="text-lg font-semibold text-white">Pagamento Seguro</h3>
        </div>
        
        <div className="space-y-4">
          <PaymentElement 
            options={{
              layout: 'tabs',
            }}
          />
          
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <CreditCardIcon className="h-5 w-5" />
        <span>
          {isLoading ? 'Processando...' : `Pagar ${type === 'subscription' ? 'Assinatura' : 'Curso'}`}
        </span>
      </button>
    </form>
  )
}

export default function StripePayment(props: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: props.type,
          planId: props.planId,
          courseId: props.courseId,
          amount: props.amount,
          escudosToUse: props.escudosToUse,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }

      setClientSecret(data.clientSecret)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      props.onError?.(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  // Criar payment intent quando o componente montar
  useEffect(() => {
    createPaymentIntent()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-white">Preparando pagamento...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-red-400 font-semibold mb-2">Erro no Pagamento</h3>
        <p className="text-red-300 text-sm">{error}</p>
        <button
          onClick={createPaymentIntent}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6">
        <p className="text-yellow-300">Preparando pagamento...</p>
      </div>
    )
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#1e293b',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}
