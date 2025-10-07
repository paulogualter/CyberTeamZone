'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { XMarkIcon, CreditCardIcon, CurrencyDollarIcon, ArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Course } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useUserEscudos } from '@/hooks/useUserEscudos'

interface PaymentModalProps {
  course: Course
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface PurchaseOptions {
  course: Course
  user: {
    escudos: number
    subscriptionPlan: string | null
    subscriptionStatus: string
  }
  purchaseOptions: {
    canPayWithEscudos: boolean
    escudosNeeded: number
    canPayWithMoney: boolean
    currentPlan: {
      name: string
      price: number
      escudos: number
      features: string[]
    }
    upgradeOptions: Array<{
      plan: string
      name: string
      price: number
      escudos: number
      escudosAfterUpgrade: number
      canAffordCourse: boolean
    }>
  }
}

export default function PaymentModal({ course, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { refreshEscudos } = useUserEscudos()
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'escudos'>('stripe')
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseOptions, setPurchaseOptions] = useState<PurchaseOptions | null>(null)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false)

  // Fetch purchase options when modal opens
  useEffect(() => {
    if (isOpen && course) {
      fetchPurchaseOptions()
    }
  }, [isOpen, course])

  const fetchPurchaseOptions = async () => {
    setIsLoadingOptions(true)
    try {
      const response = await fetch('/api/courses/purchase-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId: course.id }),
      })

      const data = await response.json()

      if (data.success) {
        setPurchaseOptions(data)
        
        // Set default payment method based on escudos availability
        if (data.purchaseOptions.canPayWithEscudos) {
          setSelectedMethod('escudos')
        } else {
          setSelectedMethod('stripe')
        }
      } else {
        if (data.alreadyEnrolled) {
          toast.error('Você já está matriculado neste curso!')
          onClose()
        } else {
          toast.error(data.error || 'Erro ao carregar opções de compra')
        }
      }
    } catch (error) {
      console.error('Error fetching purchase options:', error)
      toast.error('Erro ao carregar opções de compra')
    } finally {
      setIsLoadingOptions(false)
    }
  }

  const handlePayment = async () => {
    console.log('🔄 handlePayment called with method:', selectedMethod)
    
    if (!session?.user) {
      console.log('❌ No session found')
      toast.error('Você precisa estar logado para fazer a compra')
      return
    }

    if (!purchaseOptions) {
      console.log('❌ No purchase options found')
      toast.error('Opções de compra não carregadas')
      return
    }

    // Check if user can pay with escudos
    if (selectedMethod === 'escudos' && !purchaseOptions.purchaseOptions.canPayWithEscudos) {
      console.log('❌ Insufficient escudos')
      toast.error('Escudos insuficientes para esta compra')
      setShowUpgradeOptions(true)
      return
    }

    console.log('✅ Starting payment process...')
    setIsProcessing(true)

    try {
      if (selectedMethod === 'escudos') {
        // Handle escudos payment
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: course.id,
            paymentMethod: selectedMethod,
            amount: course.price,
            currency: 'BRL',
          }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Erro ao processar pagamento')
        }

        toast.success('Compra realizada com sucesso!')
        // Atualizar escudos após compra bem-sucedida
        refreshEscudos()
        onSuccess()
        onClose()
      } else if (selectedMethod === 'stripe') {
        console.log('💳 Processing Stripe payment for course:', course.id, 'amount:', course.price)
        
        // Handle Stripe payment using Checkout Session
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'course',
            courseId: course.id,
            amount: course.price,
          }),
        })

        console.log('📡 Stripe API response status:', response.status)
        const data = await response.json()
        console.log('📡 Stripe API response data:', data)

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao criar checkout')
        }

        // Redirect to Stripe Checkout
        console.log('🔗 Redirecting to Stripe URL:', data.url)
        toast.success('Redirecionando para o Stripe...')
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpgradePlan = async (planId: string) => {
    try {
      setIsProcessing(true)
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          planId: planId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar checkout')
      }

      // Redirecionar para o Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Erro ao fazer upgrade do plano:', error)
      alert('Erro ao processar upgrade do plano. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const canPayWithEscudos = purchaseOptions?.purchaseOptions.canPayWithEscudos || false

  console.log('🔍 PaymentModal state:', {
    selectedMethod,
    canPayWithEscudos,
    isProcessing,
    hasPurchaseOptions: !!purchaseOptions
  })

  if (!isOpen) return null

  if (isLoadingOptions) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando opções de compra...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-800 rounded-xl shadow-2xl max-w-5xl w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-white">
                Finalizar Compra
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
            </div>

            {/* Escudos Insuficientes Warning */}
            {purchaseOptions && !purchaseOptions.purchaseOptions.canPayWithEscudos && (
              <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-yellow-400 mb-2">
                      Escudos Insuficientes
                    </h4>
                    <p className="text-gray-300 mb-3">
                      Você tem <span className="font-semibold text-white">{purchaseOptions.user.escudos}</span> escudos, 
                      mas precisa de <span className="font-semibold text-white">{purchaseOptions.course.escudosPrice}</span> escudos para comprar este curso.
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
                        className="flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-semibold"
                      >
                        <ArrowUpIcon className="h-5 w-5 mr-2" />
                        {showUpgradeOptions ? 'Ocultar' : 'Ver'} Opções de Upgrade
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Options */}
            {showUpgradeOptions && purchaseOptions && (
              <div className="mb-6 p-6 bg-slate-700/50 rounded-xl">
                <h4 className="text-xl font-semibold text-white mb-4">
                  Escolha um Plano para Obter Mais Escudos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {purchaseOptions.purchaseOptions.upgradeOptions.map((option) => (
                    <div
                      key={option.plan}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        option.canAffordCourse
                          ? 'border-green-500 bg-green-900/20'
                          : 'border-gray-600 bg-slate-600/20'
                      }`}
                    >
                      <div className="text-center">
                        <h5 className="text-lg font-semibold text-white mb-2">{option.name}</h5>
                        <p className="text-2xl font-bold text-blue-400 mb-2">R$ {option.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-300 mb-3">
                          +{option.escudos} escudos mensais
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                          Total após upgrade: {option.escudosAfterUpgrade} escudos
                        </p>
                        <button
                          onClick={() => handleUpgradePlan(option.plan)}
                          disabled={isProcessing}
                          className="w-full px-4 py-2 rounded-lg font-semibold transition-colors bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processando...' : 'Fazer Upgrade'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Info */}
              <div className="space-y-6">
                <div className="p-6 bg-slate-700/50 rounded-xl">
                  <h4 className="text-2xl font-bold text-white mb-4">
                    {purchaseOptions?.course.title || course.title}
                  </h4>
                  <p className="text-gray-300 text-lg mb-6">
                    {(purchaseOptions?.course.shortDescription || course.shortDescription || '').substring(0, 50)}
                    {((purchaseOptions?.course.shortDescription || course.shortDescription || '').length > 50) && '...'}
                  </p>
                  
                  {/* User Escudos Info */}
                  {purchaseOptions && (
                    <div className="mb-4 p-3 bg-slate-600/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Seus Escudos:</span>
                        <span className="text-lg font-semibold text-yellow-400">
                          {purchaseOptions.user.escudos} escudos
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-300">Plano Atual:</span>
                        <span className="text-sm font-medium text-blue-400">
                          {purchaseOptions.purchaseOptions.currentPlan.name}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-600/50 rounded-lg">
                      <span className="text-lg text-gray-300">Preço em Dinheiro:</span>
                      <span className="text-3xl font-bold text-white">
                        R$ {(purchaseOptions?.course.price || course.price).toFixed(2)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-lg border ${
                      canPayWithEscudos 
                        ? 'bg-green-900/20 border-green-500/30' 
                        : 'bg-yellow-900/20 border-yellow-500/30'
                    }`}>
                      <span className="text-lg text-gray-300">Preço em Escudos:</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-yellow-400">
                          {(purchaseOptions?.course.escudosPrice || course.escudosPrice)} Escudos
                        </span>
                        {purchaseOptions && !canPayWithEscudos && (
                          <p className="text-sm text-yellow-300 mt-1">
                            Faltam {purchaseOptions.purchaseOptions.escudosNeeded} escudos
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Features */}
                <div className="p-6 bg-slate-700/30 rounded-xl">
                  <h5 className="text-lg font-semibold text-white mb-4">O que você vai aprender:</h5>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Acesso vitalício ao curso
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Certificado de conclusão
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Suporte da comunidade
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Atualizações gratuitas
                    </li>
                  </ul>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-white mb-6">Escolha o Método de Pagamento</h4>
                <div className="space-y-4">
                  <label className="flex items-center p-6 border-2 border-gray-600 rounded-xl cursor-pointer hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-200">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={selectedMethod === 'stripe'}
                      onChange={(e) => setSelectedMethod(e.target.value as 'stripe')}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 ${
                      selectedMethod === 'stripe' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-400'
                    }`}>
                      {selectedMethod === 'stripe' && (
                        <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div className="flex items-center flex-1">
                      <CreditCardIcon className="h-8 w-8 text-blue-400 mr-4" />
                      <div>
                        <span className="text-lg font-semibold text-white">Cartão de Crédito</span>
                        <p className="text-sm text-gray-400">Stripe - Seguro e confiável</p>
                      </div>
                    </div>
                  </label>


                  <label className={`flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    canPayWithEscudos 
                      ? 'border-gray-600 hover:bg-slate-700/50 hover:border-yellow-500/50' 
                      : 'border-gray-700 opacity-50 cursor-not-allowed'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="escudos"
                      checked={selectedMethod === 'escudos'}
                      onChange={(e) => setSelectedMethod(e.target.value as 'escudos')}
                      disabled={!canPayWithEscudos}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 ${
                      selectedMethod === 'escudos' && canPayWithEscudos
                        ? 'border-yellow-500 bg-yellow-500' 
                        : 'border-gray-400'
                    }`}>
                      {selectedMethod === 'escudos' && canPayWithEscudos && (
                        <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div className="flex items-center flex-1">
                      <CurrencyDollarIcon className="h-8 w-8 text-yellow-400 mr-4" />
                      <div>
                        <span className="text-lg font-semibold text-white">Escudos</span>
                        <p className="text-sm text-gray-400">
                          {canPayWithEscudos 
                            ? `Você tem: ${purchaseOptions?.user.escudos || 0} escudos`
                            : `Escudos insuficientes (Você tem: ${purchaseOptions?.user.escudos || 0})`
                          }
                        </p>
                        {purchaseOptions && !canPayWithEscudos && (
                          <p className="text-xs text-yellow-300 mt-1">
                            Faltam {purchaseOptions.purchaseOptions.escudosNeeded} escudos
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-4 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-slate-700 hover:border-gray-500 transition-all duration-200 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing || (selectedMethod === 'escudos' && !canPayWithEscudos)}
                    className={`flex-1 px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center font-semibold text-lg shadow-lg ${
                      selectedMethod === 'escudos' && canPayWithEscudos
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                        : selectedMethod === 'escudos' && !canPayWithEscudos
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="spinner mr-3"></div>
                        Processando...
                      </>
                    ) : selectedMethod === 'escudos' ? (
                      canPayWithEscudos ? 'Comprar com Escudos' : 'Escudos Insuficientes'
                    ) : selectedMethod === 'stripe' ? (
                      'Pagar com Cartão'
                    ) : (
                      'Finalizar Compra'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  )
}