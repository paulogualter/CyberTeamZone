import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing instructor modules endpoint...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (userRole !== 'INSTRUCTOR') {
      console.log('❌ Not an instructor')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    console.log('📚 Course ID:', courseId)

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Return mock data for testing
    return NextResponse.json({ 
      success: true, 
      modules: [
        {
          id: 'test_module_1',
          title: 'Test Module 1',
          description: 'This is a test module',
          courseId: courseId,
          order: 1,
          isPublished: false,
          lessons: []
        }
      ]
    })
  } catch (error) {
    console.error('❌ Error in test modules endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Testing instructor modules POST endpoint...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (userRole !== 'INSTRUCTOR') {
      console.log('❌ Not an instructor')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    console.log('📝 Request body:', body)

    // Return mock success response
    return NextResponse.json({
      success: true,
      module: {
        id: 'test_module_' + Date.now(),
        title: body.title || 'Test Module',
        description: body.description || '',
        courseId: body.courseId,
        order: body.order || 1,
        isPublished: false,
        lessons: []
      }
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error in test modules POST endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
