import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Simple test endpoint called')
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      debug: {
        url: req.url,
        method: 'GET'
      }
    })

  } catch (error) {
    console.error('❌ Simple test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
