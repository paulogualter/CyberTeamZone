import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Frontend debug endpoint working',
      timestamp: new Date().toISOString(),
      categories: [
        { id: '1', name: 'Test Category 1', description: 'Test 1', icon: '🎯', color: '#EF4444', courseCount: 5 },
        { id: '2', name: 'Test Category 2', description: 'Test 2', icon: '🛡️', color: '#10B981', courseCount: 3 }
      ]
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
