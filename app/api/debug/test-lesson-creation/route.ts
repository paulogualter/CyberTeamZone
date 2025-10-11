import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug lesson creation endpoint called')
    
    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId')
    
    console.log('📚 Module ID:', moduleId)
    
    if (!moduleId) {
      return NextResponse.json({ 
        error: 'Module ID is required',
        usage: 'Add ?moduleId=YOUR_MODULE_ID to the URL'
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

    // Test 2: Check module exists
    console.log('🔍 Checking module exists...')
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId, title')
      .eq('id', moduleId)
      .single()

    console.log('📊 Module check:', { module: !!module, error: moduleErr?.message })

    if (moduleErr || !module) {
      return NextResponse.json({ 
        error: 'Module not found',
        debug: {
          sessionExists: true,
          userId: session.user.id,
          userRole,
          moduleId,
          moduleError: moduleErr?.message
        }
      }, { status: 404 })
    }

    // Test 3: Check course permissions (for instructors)
    if (userRole === 'INSTRUCTOR') {
      console.log('🔍 Checking course permissions for instructor...')
      const { data: course, error: courseErr } = await supabaseAdmin
        .from('Course')
        .select('id, instructorId, title')
        .eq('id', module.courseId)
        .single()

      console.log('📊 Course check:', { course: !!course, error: courseErr?.message })

      if (courseErr || !course || course.instructorId !== session.user.id) {
        return NextResponse.json({ 
          error: 'Course not found or access denied',
          debug: {
            sessionExists: true,
            userId: session.user.id,
            userRole,
            moduleId,
            courseId: module.courseId,
            courseError: courseErr?.message,
            courseInstructorId: course?.instructorId,
            sessionUserId: session.user.id,
            hasPermission: course?.instructorId === session.user.id
          }
        }, { status: 403 })
      }
    }

    // Test 4: Check existing lessons
    console.log('🔍 Checking existing lessons...')
    const { data: existingLessons, error: lessonsErr } = await supabaseAdmin
      .from('Lesson')
      .select('id, title, order')
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    console.log('📊 Existing lessons:', { count: existingLessons?.length || 0, error: lessonsErr?.message })

    // Test 5: Simulate lesson creation (without actually creating)
    const nextOrder = existingLessons?.length ? Math.max(...existingLessons.map(l => l.order || 0)) + 1 : 1
    const testLessonId = `lesson_${Date.now()}_test`
    
    console.log('🧪 Test lesson data:', {
      id: testLessonId,
      title: 'Test Lesson',
      moduleId,
      order: nextOrder
    })

    return NextResponse.json({
      success: true,
      debug: {
        sessionExists: true,
        userId: session.user.id,
        userRole,
        moduleId,
        moduleTitle: module.title,
        courseId: module.courseId,
        existingLessonsCount: existingLessons?.length || 0,
        existingLessons: existingLessons || [],
        nextOrder,
        testLessonId,
        canCreateLesson: true
      }
    })

  } catch (error) {
    console.error('❌ Error in debug lesson creation:', error)
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

// POST - Actually test lesson creation
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Debug lesson creation POST endpoint called')
    
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

    const { moduleId, title = 'Test Lesson', description = 'Test Description' } = body

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Verify module exists
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', moduleId)
      .single()

    if (moduleErr || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Check permissions for instructors
    if (userRole === 'INSTRUCTOR') {
      const { data: course, error: courseErr } = await supabaseAdmin
        .from('Course')
        .select('id, instructorId')
        .eq('id', module.courseId)
        .single()

      if (courseErr || !course || course.instructorId !== session.user.id) {
        return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 })
      }
    }

    // Get next order
    const { data: lastLesson } = await supabaseAdmin
      .from('Lesson')
      .select('order')
      .eq('moduleId', moduleId)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = lastLesson?.order ? (Number(lastLesson.order) + 1) : 1

    // Create test lesson
    const nowIso = new Date().toISOString()
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    const { data: created, error: createErr } = await supabaseAdmin
      .from('Lesson')
      .insert({
        id: lessonId,
        title,
        description,
        content: 'Test content',
        moduleId,
        order: nextOrder,
        duration: 0,
        videoUrl: '',
        isPublished: false,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    if (createErr) {
      console.error('❌ Error creating test lesson:', createErr)
      return NextResponse.json({ 
        error: 'Failed to create lesson',
        debug: { supabaseError: createErr.message }
      }, { status: 500 })
    }

    console.log('✅ Test lesson created successfully:', created?.id)
    return NextResponse.json({
      success: true,
      lesson: created,
      debug: {
        lessonId: created?.id,
        moduleId,
        title,
        userRole,
        nextOrder
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error in debug lesson creation POST:', error)
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
