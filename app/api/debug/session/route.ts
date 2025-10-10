import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug session endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session details:', {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: (session?.user as any)?.role,
      sessionExpires: session?.expires
    })
    
    return NextResponse.json({
      success: true,
      session: {
        exists: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userRole: (session?.user as any)?.role,
        sessionExpires: session?.expires
      }
    })
  } catch (error) {
    console.error('❌ Error in debug session:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
