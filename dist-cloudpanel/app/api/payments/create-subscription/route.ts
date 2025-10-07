import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const planPrices = {
  basic: 4990, // R$ 49.90 em centavos
  gold: 7990, // R$ 79.90 em centavos
  diamond: 12990, // R$ 129.90 em centavos
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { planId, userId } = await request.json()

    if (!planId || !userId) {
      return NextResponse.json({ error: 'Plano e usuário são obrigatórios' }, { status: 400 })
    }

    const planPrice = planPrices[planId as keyof typeof planPrices]
    if (!planPrice) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    // Verificar se o usuário é administrador e status de assinatura atual
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, subscriptionStatus: true }
    })

    if (user?.role === 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Administradores não precisam de assinatura',
        redirectTo: '/dashboard'
      })
    }

    // Verificar se o usuário já tem uma assinatura ativa (pelo campo do próprio usuário)
    if (user?.subscriptionStatus === 'ACTIVE') {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário já possui uma assinatura ativa',
        redirectTo: '/dashboard'
      })
    }

    // Criar produto no Stripe se não existir
    let productId = process.env[`STRIPE_${planId.toUpperCase()}_PRODUCT_ID`]
    
    if (!productId) {
      const product = await stripe.products.create({
        name: `CyberTeam ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        description: `Plano ${planId} do CyberTeam.Zone`,
      })
      productId = product.id
    }

    // Criar preço no Stripe se não existir
    let priceId = process.env[`STRIPE_${planId.toUpperCase()}_PRICE_ID`]
    
    if (!priceId) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: planPrice,
        currency: 'brl',
        recurring: {
          interval: 'month',
        },
      })
      priceId = price.id
    }

    // Criar sessão de checkout do Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/plans?subscription=cancelled`,
      customer_email: session.user.email || undefined,
      metadata: {
        userId: userId,
        planId: planId,
      },
    })

    return NextResponse.json({
      success: true,
      paymentUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })

  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
