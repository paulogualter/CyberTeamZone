import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'
import { addEscudos, calculateCourseEscudos, useEscudos } from '@/lib/escudos'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break
      case 'checkout.session.completed':
        await handleCheckoutSuccess(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const { paymentId, userId, courseId, escudosUsed } = paymentIntent.metadata

  if (!paymentId || !userId || !courseId) {
    console.error('Missing metadata in payment intent')
    return
  }

  try {
    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        paymentId: paymentIntent.id,
        escudosUsed: escudosUsed ? parseInt(escudosUsed) : 0,
      },
    })

    // Enroll user in course
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        userId,
        courseId,
        isActive: true,
      },
    })

    // Use escudos if specified
    if (escudosUsed && parseInt(escudosUsed) > 0) {
      const escudosUsedAmount = parseInt(escudosUsed)
      const escudosUsedSuccess = await useEscudos(userId, escudosUsedAmount)
      
      if (!escudosUsedSuccess) {
        console.error('Failed to use escudos for payment:', paymentId)
        // Note: Payment is already completed, so we continue
      }
    }

    // Add escudos for direct course purchase
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { price: true }
    })

    if (course) {
      const escudosToAdd = calculateCourseEscudos(course.price)
      
      if (escudosToAdd > 0) {
        await addEscudos({
          userId,
          amount: escudosToAdd,
          source: 'COURSE_PURCHASE',
          paymentId: paymentId,
          courseId: courseId
        })
      }
    }

    console.log(`Payment ${paymentId} completed successfully`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  const { paymentId } = paymentIntent.metadata

  if (!paymentId) {
    console.error('Missing paymentId in payment intent')
    return
  }

  try {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'FAILED',
        paymentId: paymentIntent.id,
      },
    })

    console.log(`Payment ${paymentId} failed`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handleCheckoutSuccess(checkoutSession: any) {
  const { userId, planId, courseId, escudosUsed, totalAmount, type } = checkoutSession.metadata

  console.log('🔍 Checkout session metadata:', checkoutSession.metadata)

  if (!userId) {
    console.error('Missing userId in checkout session metadata')
    return
  }

  try {
    if (type === 'subscription' && planId) {
      // Processar assinatura
      console.log('📋 Processing subscription purchase:', planId)
      await processSubscriptionPurchase(userId, planId, checkoutSession.id)
    } else if (type === 'course' && courseId) {
      // Processar compra de curso
      console.log('🎓 Processing course purchase:', courseId)
      await processCoursePurchase(userId, courseId, checkoutSession.id, escudosUsed, totalAmount)
    } else {
      console.log('⚠️ Unknown checkout type or missing data:', { type, planId, courseId })
    }

    console.log(`✅ Checkout session ${checkoutSession.id} completed successfully`)
  } catch (error) {
    console.error('❌ Error handling checkout success:', error)
  }
}

async function processSubscriptionPurchase(userId: string, planId: string, stripeSessionId: string) {
  // Buscar plano
  const plan = await prisma.subscription.findFirst({
    where: { name: planId }
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  // Atualizar usuário com assinatura
  const planEnum = mapPlanIdToEnum(planId)
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'ACTIVE',
      subscriptionPlan: planEnum,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    },
  })

  // Adicionar escudos baseado no plano
  const escudosToAdd = getEscudosForPlan(planId)
  if (escudosToAdd > 0) {
    await addEscudos({
      userId: userId,
      amount: escudosToAdd,
      source: 'SUBSCRIPTION'
    })
  }
}

async function processCoursePurchase(userId: string, courseId: string, stripeSessionId: string, escudosUsed: string, totalAmount: string) {
  console.log('🎓 Starting course purchase process:', { userId, courseId, stripeSessionId, escudosUsed, totalAmount })
  
  // Buscar curso
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  })

  if (!course) {
    console.error('❌ Course not found:', courseId)
    throw new Error('Course not found')
  }

  const escudosUsedAmount = parseInt(escudosUsed) || 0
  const totalAmountValue = parseFloat(totalAmount) || course.price

  console.log('💰 Payment details:', { escudosUsedAmount, totalAmountValue, coursePrice: course.price })

  // Criar registro de pagamento
  const payment = await prisma.payment.create({
    data: {
      amount: totalAmountValue,
      currency: 'BRL',
      status: 'COMPLETED',
      paymentMethod: 'STRIPE',
      paymentId: stripeSessionId,
      escudosUsed: escudosUsedAmount,
      userId: userId,
      courseId: courseId,
    },
  })

  console.log('💳 Payment created:', payment.id)

  // Usar escudos se especificados
  if (escudosUsedAmount > 0) {
    console.log('🛡️ Using escudos:', escudosUsedAmount)
    const escudosUsedSuccess = await useEscudos(userId, escudosUsedAmount)
    
    if (!escudosUsedSuccess) {
      console.error('❌ Failed to use escudos for course purchase:', courseId)
    } else {
      console.log('✅ Escudos used successfully')
    }
  }

  // Matricular usuário no curso
  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: userId,
        courseId: courseId,
      },
    },
    update: {
      isActive: true,
    },
    create: {
      userId: userId,
      courseId: courseId,
      isActive: true,
    },
  })

  console.log('🎓 User enrolled in course:', enrollment.id)

  // Adicionar escudos pela compra do curso
  const escudosToAdd = calculateCourseEscudos(course.price)
  if (escudosToAdd > 0) {
    console.log('🛡️ Adding escudos for course purchase:', escudosToAdd)
    await addEscudos({
      userId: userId,
      amount: escudosToAdd,
      source: 'COURSE_PURCHASE',
      paymentId: payment.id,
      courseId: courseId
    })
    console.log('✅ Escudos added successfully')
  }

  console.log('✅ Course purchase process completed successfully')
}

function getEscudosForPlan(planId: string): number {
  switch (planId) {
    case 'basic': return 50
    case 'gold': return 80
    case 'diamond': return 130
    default: return 0
  }
}

function mapPlanIdToEnum(planId: string) {
  switch (planId.toLowerCase()) {
    case 'basic':
      return 'BASIC' as any
    case 'gold':
      return 'GOLD' as any
    case 'diamond':
      return 'DIAMOND' as any
    default:
      return null
  }
}
