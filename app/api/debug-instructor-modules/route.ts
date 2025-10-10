import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug instructor modules endpoint...')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    console.log('👤 User ID:', session?.user?.id)
    console.log('🎭 User role:', (session?.user as any)?.role)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasUserId: !!session?.user?.id,
          userRole: (session?.user as any)?.role
        }
      }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'INSTRUCTOR') {
      return NextResponse.json({ 
        error: 'Forbidden',
        debug: {
          userRole,
          expectedRole: 'INSTRUCTOR'
        }
      }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    console.log('📚 Course ID:', courseId)

    if (!courseId) {
      return NextResponse.json({ 
        error: 'Course ID is required',
        debug: { courseId }
      }, { status: 400 })
    }

    // Test Supabase connection
    console.log('🔗 Testing Supabase connection...')
    const { data: testData, error: testError } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', courseId)
      .eq('instructorId', session.user.id)
      .single()

    console.log('📊 Supabase test result:', { testData, testError })

    if (testError || !testData) {
      return NextResponse.json({ 
        error: 'Course not found or access denied',
        debug: {
          courseId,
          instructorId: session.user.id,
          supabaseError: testError?.message
        }
      }, { status: 404 })
    }

    // Fetch modules
    console.log('📚 Fetching modules...')
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select(`
        *,
        lessons:Lesson(*)
      `)
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    console.log('📊 Modules result:', { modules, modErr })

    if (modErr) {
      console.error('❌ Error fetching modules:', modErr)
      return NextResponse.json({ 
        error: 'Failed to fetch modules',
        debug: { supabaseError: modErr.message }
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      modules: modules || [],
      debug: {
        courseId,
        instructorId: session.user.id,
        modulesCount: modules?.length || 0
      }
    })
  } catch (error) {
    console.error('❌ Error in debug modules endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}
