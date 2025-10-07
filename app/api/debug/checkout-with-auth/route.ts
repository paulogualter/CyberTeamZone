import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const { planId } = await request.json()
    console.log('🔍 Debug: Testing checkout with simulated auth for plan:', planId)
    
    // Simular um usuário autenticado
    const userId = 'test-user-id'
    const userEmail = 'test@example.com'
    
    // Normalizar o nome do plano (primeira letra maiúscula)
    const normalizedPlanId = planId.charAt(0).toUpperCase() + planId.slice(1).toLowerCase()
    console.log('🔍 Debug: Normalized plan ID:', normalizedPlanId)
    
    // Buscar plano no banco
    const { data: plan, error: planError } = await supabaseAdmin
      .from('Subscription')
      .select('*')
      .eq('name', normalizedPlanId)
      .single()

    console.log('📋 Debug: Plan query result:', { plan, planError })

    if (planError) {
      console.error('❌ Plan query error:', planError)
      return NextResponse.json({
        success: false,
        error: `Plan query failed: ${planError.message}`,
        details: planError
      })
    }

    if (!plan) {
      console.error('❌ Plan not found for ID:', planId)
      return NextResponse.json({
        success: false,
        error: `Plan not found: ${planId}`,
        availablePlans: ['Basic', 'Gold', 'Diamond']
      })
    }

    console.log('✅ Plan found:', plan)

    // Simular criação de checkout (sem Stripe real)
    const mockCheckoutSession = {
      id: 'mock-session-id',
      url: 'https://checkout.stripe.com/mock-session',
      plan: plan
    }

    return NextResponse.json({
      success: true,
      sessionId: mockCheckoutSession.id,
      url: mockCheckoutSession.url,
      plan: plan,
      message: `Mock checkout session created for plan ${planId}`
    })
  } catch (error) {
    console.error('❌ Debug checkout with auth error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug checkout with auth failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
