import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { headers } from 'next/headers'
import { addEscudos, calculateCourseEscudos, useEscudos } from '@/lib/escudos'
// Updated: Migrated from Prisma to Supabase

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
    await supabaseAdmin
      .from('Payment')
      .update({
        status: 'COMPLETED',
        paymentId: paymentIntent.id,
        escudosUsed: escudosUsed ? parseInt(escudosUsed) : 0,
      })
      .eq('id', paymentId)

    // Check if enrollment exists
    const { data: existingEnrollment } = await supabaseAdmin
      .from('Enrollment')
      .select('id')
      .eq('userId', userId)
      .eq('courseId', courseId)
      .maybeSingle()

    if (existingEnrollment) {
      // Update existing enrollment
      await supabaseAdmin
        .from('Enrollment')
        .update({ isActive: true })
        .eq('id', existingEnrollment.id)
    } else {
      // Create new enrollment
      await supabaseAdmin
        .from('Enrollment')
        .insert({
          userId,
          courseId,
          isActive: true,
          progress: 0
        })
    }

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
    const { data: course } = await supabaseAdmin
      .from('Course')
      .select('price')
      .eq('id', courseId)
      .maybeSingle()

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
    await supabaseAdmin
      .from('Payment')
      .update({ status: 'FAILED' })
      .eq('id', paymentId)

    console.log(`Payment ${paymentId} failed`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handleCheckoutSuccess(session: any) {
  const { userId, planId, courseId } = session.metadata

  if (!userId) {
    console.error('Missing userId in checkout session')
    return
  }

  try {
    if (planId) {
      // Handle subscription plan
      const { data: plan } = await supabaseAdmin
        .from('Subscription')
        .select('name, price, escudos')
        .eq('id', planId)
        .maybeSingle()

      if (plan) {
        // Update user subscription
        await supabaseAdmin
          .from('User')
          .update({
            subscriptionStatus: 'ACTIVE',
            subscriptionPlan: plan.name
          })
          .eq('id', userId)

        // Add escudos for subscription
        if (plan.escudos > 0) {
          await addEscudos({
            userId,
            amount: plan.escudos,
            source: 'SUBSCRIPTION',
            paymentId: session.id
          })
        }
      }
    }

    if (courseId) {
      // Handle course purchase
      const { data: course } = await supabaseAdmin
        .from('Course')
        .select('price')
        .eq('id', courseId)
        .maybeSingle()

      if (course) {
        // Create payment record
        const { data: payment } = await supabaseAdmin
          .from('Payment')
          .insert({
            userId,
            courseId,
            amount: course.price,
            status: 'COMPLETED',
            paymentId: session.id,
            stripeSessionId: session.id
          })
          .select('id')
          .single()

        // Create enrollment
        const { data: existingEnrollment } = await supabaseAdmin
          .from('Enrollment')
          .select('id')
          .eq('userId', userId)
          .eq('courseId', courseId)
          .maybeSingle()

        if (!existingEnrollment) {
          await supabaseAdmin
            .from('Enrollment')
            .insert({
              userId,
              courseId,
              isActive: true,
              progress: 0
            })
        }

        // Add escudos for course purchase
        const escudosToAdd = calculateCourseEscudos(course.price)
        if (escudosToAdd > 0 && payment) {
          await addEscudos({
            userId,
            amount: escudosToAdd,
            source: 'COURSE_PURCHASE',
            paymentId: payment.id,
            courseId: courseId
          })
        }
      }
    }

    console.log(`Checkout session ${session.id} completed successfully`)
  } catch (error) {
    console.error('Error handling checkout success:', error)
  }
}
