import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { calculateMaxEscudosForPurchase, calculateRemainingAmount } from '@/lib/escudos'
// Updated: Migrated from Prisma to Supabase

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      type, 
      planId, 
      courseId, 
      amount, 
      escudosToUse = 0,
      currency = 'brl' 
    } = await request.json()

    if (!type || !session.user.id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let paymentIntent

    if (type === 'subscription' && planId) {
      // Criar payment intent para assinatura
      paymentIntent = await createSubscriptionPaymentIntent(session.user.id, planId)
    } else if (type === 'course' && courseId && amount) {
      // Criar payment intent para curso
      paymentIntent = await createCoursePaymentIntent(session.user.id, courseId, amount, escudosToUse, currency)
    } else {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

async function createSubscriptionPaymentIntent(userId: string, planId: string) {
  // Buscar plano no banco
  const { data: plan, error: planErr } = await supabaseAdmin
    .from('Subscription')
    .select('name, price')
    .eq('name', planId)
    .maybeSingle()
  if (planErr) throw planErr

  if (!plan) {
    throw new Error('Plan not found')
  }

  // Criar payment intent para assinatura
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(plan.price * 100), // Convert to cents
    currency: 'brl',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      userId: userId,
      planId: planId,
      type: 'subscription'
    },
  })

  return paymentIntent
}

async function createCoursePaymentIntent(userId: string, courseId: string, amount: number, escudosToUse: number, currency: string) {
  // Buscar curso no banco
  const { data: course, error: courseErr } = await supabaseAdmin
    .from('Course')
    .select('id, price')
    .eq('id', courseId)
    .maybeSingle()
  if (courseErr) throw courseErr

  if (!course) {
    throw new Error('Course not found')
  }

  // Validar limite de 30% de escudos
  const maxEscudosAllowed = calculateMaxEscudosForPurchase(course.price)
  if (escudosToUse > maxEscudosAllowed) {
    throw new Error(`Máximo de ${maxEscudosAllowed} escudos permitidos (30% do valor do curso)`)
  }

  // Calcular valor restante
  const remainingAmount = calculateRemainingAmount(amount, escudosToUse)

  if (remainingAmount <= 0) {
    throw new Error('Valor restante deve ser maior que zero')
  }

  // Criar payment intent para curso
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(remainingAmount * 100), // Convert to cents
    currency: currency,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      userId: userId,
      courseId: courseId,
      escudosUsed: escudosToUse.toString(),
      totalAmount: amount.toString(),
      type: 'course'
    },
  })

  return paymentIntent
}
