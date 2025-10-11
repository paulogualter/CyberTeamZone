import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Test admin lessons endpoint called')
    
    // Test 1: Check session
    const session = await getServerSession(authOptions)
    console.log('📋 Session check:', {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: (session?.user as any)?.role
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session found',
        debug: { session: null }
      }, { status: 401 })
    }

    // Test 2: Check role
    const userRole = (session.user as any)?.role
    console.log('👤 Role check:', userRole)
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Not an admin',
        debug: { role: userRole, expected: 'ADMIN' }
      }, { status: 403 })
    }

    // Test 3: Parse request body
    let requestBody
    try {
      requestBody = await req.json()
      console.log('📝 Request body parsed:', requestBody)
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error'
      console.log('❌ Error parsing request body:', errorMessage)
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        debug: { parseError: errorMessage }
      }, { status: 400 })
    }

    const { title, moduleId } = requestBody

    // Test 4: Validate required fields
    if (!title || !moduleId) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        debug: { title: !!title, moduleId: !!moduleId }
      }, { status: 400 })
    }

    // Test 5: Check module exists
    console.log('🔍 Checking module:', moduleId)
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', moduleId)
      .single()

    console.log('📊 Module check result:', { 
      module: !!module, 
      error: moduleErr?.message,
      moduleId: module?.id,
      courseId: module?.courseId
    })

    if (moduleErr || !module) {
      return NextResponse.json({ 
        error: 'Module not found',
        debug: { 
          moduleId,
          supabaseError: moduleErr?.message,
          module: module
        }
      }, { status: 404 })
    }

    // Test 6: Check course exists
    console.log('🔍 Checking course:', module.courseId)
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId, title')
      .eq('id', module.courseId)
      .single()

    console.log('📊 Course check result:', { 
      course: !!course, 
      error: courseErr?.message,
      courseId: course?.id,
      courseTitle: course?.title
    })

    if (courseErr || !course) {
      return NextResponse.json({ 
        error: 'Course not found',
        debug: { 
          courseId: module.courseId,
          supabaseError: courseErr?.message,
          course: course
        }
      }, { status: 404 })
    }

    // Test 7: Get next order
    console.log('🔍 Getting next order for module:', moduleId)
    const { data: lastLesson, error: lastErr } = await supabaseAdmin
      .from('Lesson')
      .select('order')
      .eq('moduleId', moduleId)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = lastLesson?.order ? (Number(lastLesson.order) + 1) : 1
    console.log('📊 Next order:', nextOrder)

    // Test 8: Simulate lesson creation (don't actually create)
    const nowIso = new Date().toISOString()
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    
    console.log('🔗 Would create lesson with:', {
      id: lessonId,
      title,
      moduleId,
      order: nextOrder,
      createdAt: nowIso
    })

    return NextResponse.json({
      success: true,
      message: 'All tests passed - lesson creation would succeed',
      debug: {
        session: {
          userId: session.user.id,
          userEmail: session.user.email,
          userRole: userRole
        },
        module: {
          id: module.id,
          courseId: module.courseId
        },
        course: {
          id: course.id,
          title: course.title,
          instructorId: course.instructorId
        },
        lesson: {
          id: lessonId,
          title,
          moduleId,
          order: nextOrder,
          createdAt: nowIso
        }
      }
    })

  } catch (error) {
    console.error('❌ Test error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    return NextResponse.json({
      error: 'Test failed',
      debug: {
        error: errorMessage,
        stack: errorStack
      }
    }, { status: 500 })
  }
}
