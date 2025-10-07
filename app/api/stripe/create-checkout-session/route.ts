import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, planId, courseId, amount, escudosToUse = 0 } = await request.json()

    if (!type || !session.user.id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let checkoutSession

    if (type === 'subscription' && planId) {
      // Criar sessão de checkout para assinatura
      checkoutSession = await createSubscriptionCheckout(session.user.id, planId, session.user.email || undefined)
    } else if (type === 'course' && courseId && amount) {
      // Criar sessão de checkout para curso
      checkoutSession = await createCourseCheckout(session.user.id, courseId, amount, escudosToUse || 0, session.user.email || undefined)
    } else {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createSubscriptionCheckout(userId: string, planId: string, userEmail?: string) {
  console.log('🔍 Debug: Looking for plan:', planId)
  
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
    throw new Error(`Plan query failed: ${planError.message}`)
  }

  if (!plan) {
    console.error('❌ Plan not found for ID:', planId)
    throw new Error(`Plan not found: ${planId}`)
  }

  console.log('✅ Plan found:', plan)

  // Criar produto no Stripe se não existir
  let productId = process.env[`STRIPE_${planId.toUpperCase()}_PRODUCT_ID`]
  
  if (!productId) {
    const product = await stripe.products.create({
      name: `Plano ${plan.name}`,
      description: `Assinatura mensal do plano ${plan.name}`,
    })
    productId = product.id
  }

  // Criar preço no Stripe se não existir
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
  })

  let priceId = prices.data[0]?.id

  if (!priceId) {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(plan.price * 100), // Convert to cents
      currency: 'brl',
      recurring: {
        interval: 'month',
      },
    })
    priceId = price.id
  }

  // Criar sessão de checkout
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&type=subscription`,
    cancel_url: `${process.env.NEXTAUTH_URL}/plans?canceled=true`,
    metadata: {
      userId: userId,
      planId: planId,
    },
    customer_email: userEmail,
  })

  return checkoutSession
}

async function createCourseCheckout(userId: string, courseId: string, amount: number, escudosToUse: number, userEmail?: string) {
  // Buscar curso no banco
  const { data: course, error: courseError } = await supabaseAdmin
    .from('Course')
    .select('*')
    .eq('id', courseId)
    .single()

  if (courseError || !course) {
    throw new Error('Course not found')
  }

  // Validar limite de 30% de escudos
  const maxEscudosAllowed = Math.floor(course.price * 0.30)
  if (escudosToUse > maxEscudosAllowed) {
    throw new Error(`Máximo de ${maxEscudosAllowed} escudos permitidos (30% do valor do curso)`)
  }

  // Calcular valor restante
  const remainingAmount = Math.max(0, amount - escudosToUse)

  // Validar URL da imagem
  const isValidImageUrl = (url: string) => {
    try {
      new URL(url)
      return url.startsWith('http://') || url.startsWith('https://')
    } catch {
      return false
    }
  }

  // Criar produto no Stripe
  const product = await stripe.products.create({
    name: course.title,
    description: course.shortDescription || course.description.substring(0, 100),
    images: course.coverImage && isValidImageUrl(course.coverImage) ? [course.coverImage] : [],
  })

  // Criar preço no Stripe
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(remainingAmount * 100), // Convert to cents
    currency: 'brl',
  })

  // Criar sessão de checkout
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&type=course`,
    cancel_url: `${process.env.NEXTAUTH_URL}/member/courses?canceled=true`,
    metadata: {
      userId: userId,
      courseId: courseId,
      escudosUsed: escudosToUse.toString(),
      totalAmount: amount.toString(),
      type: 'course',
    },
    customer_email: userEmail,
  })

  return checkoutSession
}
