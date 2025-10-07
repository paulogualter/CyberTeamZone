'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import PlanCheckout from '@/components/PlanCheckout'
import { useUserStatus } from '@/hooks/useUserStatus'

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49.90,
    escudos: 50,
    description: 'Perfect for cybersecurity beginners',
    features: [
      'Access to basic courses',
      '50 monthly shields',
      'Email support',
      'Basic certificates',
      'Student community'
    ],
    popular: false,
    color: 'blue'
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 79.90,
    escudos: 80,
    description: 'Ideal for developing professionals',
    features: [
      'Access to all courses',
      '80 monthly shields',
      'Priority support',
      'Advanced certificates',
      'Exclusive CTF Challenges',
      'Monthly mentoring',
      'Premium forum access'
    ],
    popular: true,
    color: 'yellow'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    price: 129.90,
    escudos: 130,
    description: 'For cybersecurity experts and leaders',
    features: [
      'Full platform access',
      '130 monthly shields',
      '24/7 support',
      'Specialized certificates',
      'Premium CTF Challenges',
      'Weekly mentoring',
      'VIP forum access',
      'Exclusive webinars',
      'Personalized consulting'
    ],
    popular: false,
    color: 'purple'
  }
]

export default function PlansPage() {
  const { data: session, status } = useSession()
  const { userStatus, isLoading: userStatusLoading, isAdmin, hasActiveSubscription } = useUserStatus()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  
  const [upgradePlan, setUpgradePlan] = useState<string | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading' || userStatusLoading) return
    
    // Se não há sessão mas há dados do usuário (usuário logado via OAuth mas sessão vazia)
    if (!session && userStatus) {
      console.log('🔍 User logged in via OAuth but session empty, checking user status:', userStatus)
      
      // Administradores não precisam de assinatura
      if (isAdmin) {
        console.log('🔑 Admin user detected, redirecting to admin area')
        router.push('/admin')
        return
      }
      
      // Usuários com assinatura ativa vão para dashboard
      if (hasActiveSubscription) {
        console.log('✅ User has active subscription, redirecting to dashboard')
        router.push('/dashboard')
        return
      }
    }
    
    // Lógica original para usuários com sessão válida
    if (session) {
      if (!session) {
        router.push('/auth/signin')
        return
      }
      
      // Administrators don't need subscription
      if (session.user.role === 'ADMIN') {
        router.push('/admin')
        return
      }

      // Check for upgrade parameters
      const upgradeParam = searchParams.get('upgrade')
      const courseIdParam = searchParams.get('courseId')
      
      if (upgradeParam) {
        setUpgradePlan(upgradeParam)
        setSelectedPlan(upgradeParam)
      }
      
      if (courseIdParam) {
        setCourseId(courseIdParam)
      }

      // Check if user already has active subscription (only if not upgrade)
      // Admins have full access without needing plans
      if (!upgradeParam) {
        const userRole = (session.user as any)?.role || 'STUDENT'
        const userSubscriptionStatus = (session.user as any)?.subscriptionStatus || 'INACTIVE'
        
        // Admins are redirected to dashboard
        if (userRole === 'ADMIN') {
          router.push('/admin')
          return
        }
        
        if (userSubscriptionStatus === 'ACTIVE') {
          router.push('/dashboard')
          return
        }
      }
    }
  }, [session, status, userStatus, userStatusLoading, isAdmin, hasActiveSubscription, router, searchParams])


  if (status === 'loading' || userStatusLoading) {
    return <LoadingSpinner />
  }

  if (!session && !userStatus) {
    return null
  }

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan)
  }

  const handleCheckoutSuccess = () => {
    setSelectedPlan(null)
    router.push('/dashboard?success=true')
  }

  const handleCheckoutError = (error: string) => {
    console.error('Checkout error:', error)
    // Aqui você pode mostrar uma notificação de erro
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            {upgradePlan ? 'Upgrade Your Plan' : 'Choose Your Subscription Plan'}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {upgradePlan 
              ? 'Get more shields to buy the course you want'
              : 'Unlock the full potential of the CyberTeam platform with our premium plans'
            }
          </p>
          {upgradePlan && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg max-w-md mx-auto">
              <p className="text-yellow-300 text-sm">
                💡 Após o upgrade, você terá escudos suficientes para comprar o curso!
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'border-yellow-500 shadow-2xl shadow-yellow-500/20'
                  : 'border-slate-700 hover:border-blue-500'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <StarIcon className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  plan.color === 'blue' ? 'bg-blue-500' :
                  plan.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}>
                  {plan.color === 'blue' && <CheckIcon className="h-8 w-8 text-white" />}
                  {plan.color === 'yellow' && <StarIcon className="h-8 w-8 text-white" />}
                  {plan.color === 'purple' && <SparklesIcon className="h-8 w-8 text-white" />}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-white">
                    R$ {plan.price.toFixed(2)}
                    <span className="text-lg text-gray-400">/mês</span>
                  </div>
                  <div className="text-lg text-blue-400 font-semibold">
                    {plan.escudos} escudos mensais
                  </div>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading && selectedPlan?.id === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    Processing...
                  </div>
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 text-sm">
            💳 Pagamento seguro processado por Stripe e Mercado Pago
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Cancele a qualquer momento. Sem taxas de cancelamento.
          </p>
        </motion.div>
      </main>

      {/* Plan Checkout Modal */}
      {selectedPlan && (
        <PlanCheckout
          plan={selectedPlan}
          onSuccess={handleCheckoutSuccess}
          onError={handleCheckoutError}
          onCancel={() => setSelectedPlan(null)}
        />
      )}
      
    </div>
  )
}
