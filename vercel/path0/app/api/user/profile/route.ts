import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select(`
        id,
        name,
        email,
        escudos,
        subscriptionPlan,
        subscriptionStatus,
        subscriptionStart,
        subscriptionEnd
      `)
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Buscar informações da assinatura se existir
    let subscriptionDetails = null
    if (user.subscriptionPlan) {
      const { data: subscription } = await supabaseAdmin
        .from('Subscription')
        .select('*')
        .eq('name', user.subscriptionPlan)
        .single()
      subscriptionDetails = subscription
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        escudos: user.escudos,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        subscriptionDetails
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
