import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG SUBSCRIPTION ===')
    
    // Check session
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? 'Found' : 'Not found')
    console.log('User ID:', session?.user?.id)
    
    // Check environment variables
    console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set')
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    
    // Check request body
    const body = await request.json()
    console.log('Request body:', body)
    
    // Check if required fields are present
    const { planId, userId } = body
    console.log('Plan ID:', planId)
    console.log('User ID:', userId)
    
    if (!planId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        debug: {
          planId: !!planId,
          userId: !!userId,
          session: !!session,
          stripeKey: !!process.env.STRIPE_SECRET_KEY
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug successful',
      debug: {
        planId,
        userId,
        session: !!session,
        stripeKey: !!process.env.STRIPE_SECRET_KEY,
        nextAuthUrl: process.env.NEXTAUTH_URL
      }
    })
    
  } catch (error) {
    console.error('Debug subscription error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
