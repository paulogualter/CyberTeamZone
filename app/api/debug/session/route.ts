import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug session endpoint called')
    
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({ 
      debug: {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasUserId: !!session?.user?.id,
        userId: session?.user?.id,
        userName: session?.user?.name,
        userEmail: session?.user?.email,
        userRole: (session?.user as any)?.role,
        sessionKeys: session ? Object.keys(session) : [],
        userKeys: session?.user ? Object.keys(session.user) : []
      }
    })

  } catch (error) {
    console.error('❌ Error in debug session:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}