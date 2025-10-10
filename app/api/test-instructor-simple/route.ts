import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Instructor modules endpoint is working',
    timestamp: new Date().toISOString(),
    url: req.url
  })
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Instructor modules POST endpoint is working',
    timestamp: new Date().toISOString(),
    url: req.url
  })
}
