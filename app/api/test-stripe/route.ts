import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    const nextAuthUrl = process.env.NEXTAUTH_URL
    
    return NextResponse.json({
      success: true,
      stripeKey: stripeKey ? 'Set' : 'Not set',
      nextAuthUrl: nextAuthUrl || 'Not set',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
