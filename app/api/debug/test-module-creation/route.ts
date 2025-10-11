import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug module creation endpoint called')
    
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    
    console.log('📚 Course ID:', courseId)
    
    if (!courseId) {
      return NextResponse.json({ 
        error: 'Course ID is required',
        usage: 'Add ?courseId=YOUR_COURSE_ID to the URL'
      }, { status: 400 })
    }

    // Test 1: Check session
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session found',
        debug: {
          sessionExists: false,
          userId: undefined,
          userRole: undefined
        }
      }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        debug: {
          sessionExists: true,
          userId: session.user.id,
          userRole,
          requiredRoles: ['ADMIN', 'INSTRUCTOR']
        }
      }, { status: 403 })
    }

    // Test 2: Check course exists
    console.log('🔍 Checking course exists...')
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId, title, status')
      .eq('id', courseId)
      .single()

    console.log('📊 Course check:', { course: !!course, error: courseErr?.message })

    if (courseErr || !course) {
      return NextResponse.json({ 
        error: 'Course not found',
        debug: {
          sessionExists: true,
          userId: session.user.id,
          userRole,
          courseId,
          courseError: courseErr?.message
        }
      }, { status: 404 })
    }

    // Test 3: Check course permissions (for instructors)
    if (userRole === 'INSTRUCTOR') {
      console.log('🔍 Checking course permissions for instructor...')
      
      if (course.instructorId !== session.user.id) {
        return NextResponse.json({ 
          error: 'Course access denied',
          debug: {
            sessionExists: true,
            userId: session.user.id,
            userRole,
            courseId,
            courseTitle: course.title,
            courseInstructorId: course.instructorId,
            sessionUserId: session.user.id,
            hasPermission: course.instructorId === session.user.id
          }
        }, { status: 403 })
      }
    }

    // Test 4: Check existing modules
    console.log('🔍 Checking existing modules...')
    const { data: existingModules, error: modulesErr } = await supabaseAdmin
      .from('Module')
      .select('id, title, order')
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    console.log('📊 Existing modules:', { count: existingModules?.length || 0, error: modulesErr?.message })

    // Test 5: Simulate module creation (without actually creating)
    const nextOrder = existingModules?.length ? Math.max(...existingModules.map(m => m.order || 0)) + 1 : 1
    const testModuleId = `module_${Date.now()}_test`
    
    console.log('🧪 Test module data:', {
      id: testModuleId,
      title: 'Test Module',
      courseId,
      order: nextOrder
    })

    return NextResponse.json({
      success: true,
      debug: {
        sessionExists: true,
        userId: session.user.id,
        userRole,
        courseId,
        courseTitle: course.title,
        courseStatus: course.status,
        courseInstructorId: course.instructorId,
        existingModulesCount: existingModules?.length || 0,
        existingModules: existingModules || [],
        nextOrder,
        testModuleId,
        canCreateModule: true
      }
    })

  } catch (error) {
    console.error('❌ Error in debug module creation:', error)
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

// POST - Actually test module creation
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Debug module creation POST endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    console.log('📝 Request body:', body)

    const { courseId, title = 'Test Module', description = 'Test Description' } = body

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Verify course exists
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', courseId)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check permissions for instructors
    if (userRole === 'INSTRUCTOR') {
      if (course.instructorId !== session.user.id) {
        return NextResponse.json({ error: 'Course access denied' }, { status: 403 })
      }
    }

    // Get next order
    const { data: lastModule } = await supabaseAdmin
      .from('Module')
      .select('order')
      .eq('courseId', courseId)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = lastModule?.order ? (Number(lastModule.order) + 1) : 1

    // Create test module
    const nowIso = new Date().toISOString()
    const moduleId = `module_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    const { data: created, error: createErr } = await supabaseAdmin
      .from('Module')
      .insert({
        id: moduleId,
        title,
        description,
        courseId,
        order: nextOrder,
        isPublished: false,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    if (createErr) {
      console.error('❌ Error creating test module:', createErr)
      return NextResponse.json({ 
        error: 'Failed to create module',
        debug: { supabaseError: createErr.message }
      }, { status: 500 })
    }

    console.log('✅ Test module created successfully:', created?.id)
    return NextResponse.json({
      success: true,
      module: created,
      debug: {
        moduleId: created?.id,
        courseId,
        title,
        userRole,
        nextOrder
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error in debug module creation POST:', error)
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
