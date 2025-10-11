import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Simple debug endpoint called')
    
    return NextResponse.json({
      success: true,
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
      debug: {
        method: 'POST',
        url: req.url,
        headers: Object.fromEntries(req.headers.entries())
      }
    })

  } catch (error) {
    console.error('❌ Simple debug error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
