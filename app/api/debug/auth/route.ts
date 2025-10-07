import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🔍 Debug: Testing authentication...')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Debug: Session result:', session)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'No session found',
        session: session
      })
    }

    return NextResponse.json({
      success: true,
      session: session,
      message: 'Authentication working'
    })
  } catch (error) {
    console.error('❌ Debug auth error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug auth failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
