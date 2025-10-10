import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing auth endpoint...')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session:', session ? 'Found' : 'Not found')
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID')
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasUserId: !!session?.user?.id
        }
      }, { status: 401 })
    }

    console.log('✅ Session found:', {
      userId: session.user.id,
      role: (session.user as any)?.role,
      email: session.user.email
    })

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: (session.user as any)?.role
      }
    })
  } catch (error) {
    console.error('❌ Auth test error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
