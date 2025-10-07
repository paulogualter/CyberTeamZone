import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { addEscudos } from '@/lib/escudos'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.metadata?.userId && session.metadata?.planId) {
          // Atualizar status da assinatura no usuário
          await prisma.user.update({
            where: { id: session.metadata.userId },
            data: {
              subscriptionStatus: 'ACTIVE',
              subscriptionPlan: session.metadata.planId as any,
            },
          })

          // Adicionar escudos baseado no plano (com validade de 12 meses)
          const escudosToAdd = getEscudosForPlan(session.metadata.planId)
          if (escudosToAdd > 0) {
            await addEscudos({
              userId: session.metadata.userId,
              amount: escudosToAdd,
              source: 'SUBSCRIPTION'
            })
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        // Sem tabela de Subscription por usuário; este evento pode ser ignorado
        break
      }

      case 'customer.subscription.deleted': {
        // Sem tabela de Subscription por usuário; este evento pode ser tratado via painel admin se necessário
        break
      }

      case 'invoice.payment_failed': {
        // Sem ação necessária no momento
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

function getEscudosForPlan(planId: string): number {
  switch (planId) {
    case 'basic': return 50
    case 'gold': return 80
    case 'diamond': return 130
    default: return 0
  }
}
