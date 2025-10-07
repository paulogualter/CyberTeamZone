import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Return mock data to test frontend
    const mockCategories = [
      { id: '1', name: 'Penetration Testing', description: 'Ethical hacking courses', icon: '🎯', color: '#EF4444', courseCount: 5 },
      { id: '2', name: 'Network Security', description: 'Network defense courses', icon: '🛡️', color: '#10B981', courseCount: 3 },
      { id: '3', name: 'Web App Security', description: 'Web application security', icon: '🌐', color: '#F59E0B', courseCount: 7 }
    ]

    return NextResponse.json({
      success: true,
      categories: mockCategories
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
