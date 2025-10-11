import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      session: session ? {
        user: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email,
          role: session.user?.role,
          image: session.user?.image
        },
        expires: session.expires
      } : null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in debug session:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      debug: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}