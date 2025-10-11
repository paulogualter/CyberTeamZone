import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Direct lesson creation endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      console.log('❌ Not authorized role')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    console.log('📝 Request body:', body)

    const { 
      title = 'Test Lesson', 
      description = 'Test Description', 
      content = 'Test Content',
      moduleId,
      order,
      duration = 0,
      videoUrl = ''
    } = body

    if (!moduleId) {
      console.log('❌ Missing moduleId')
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    console.log('🔍 Verifying module exists...')
    
    // Verificar se o módulo existe usando queries separadas
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', moduleId)
      .single()

    console.log('📊 Module verification:', { module: !!module, error: moduleErr?.message })

    if (moduleErr || !module) {
      console.log('❌ Module not found:', moduleErr?.message)
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    // Se for instrutor, verificar se o curso pertence a ele
    if (userRole === 'INSTRUCTOR') {
      console.log('🔍 Checking course permissions for instructor...')
      const { data: course, error: courseErr } = await supabaseAdmin
        .from('Course')
        .select('id, instructorId')
        .eq('id', module.courseId)
        .single()

      console.log('📊 Course verification:', { course: !!course, error: courseErr?.message })

      if (courseErr || !course || course.instructorId !== session.user.id) {
        console.log('❌ Course not found or access denied for instructor:', courseErr?.message)
        return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 })
      }
    }

    // Próxima ordem se não informada
    let lessonOrder = order as number | undefined
    if (!lessonOrder) {
      console.log('🔍 Getting next order...')
      const { data: last, error: lastErr } = await supabaseAdmin
        .from('Lesson')
        .select('order')
        .eq('moduleId', moduleId)
        .order('order', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (lastErr) {
        console.warn('Could not get last lesson order:', lastErr)
      }
      lessonOrder = last?.order ? (Number(last.order) + 1) : 1
      console.log('📊 Next order:', lessonOrder)
    }

    const nowIso = new Date().toISOString()
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    console.log('🆔 Generated lesson ID:', lessonId)

    console.log('🔗 Creating lesson in Supabase...')
    
    // Criar aula
    const { data: created, error: createErr } = await supabaseAdmin
      .from('Lesson')
      .insert({
        id: lessonId,
        title,
        description,
        content,
        moduleId,
        order: lessonOrder,
        duration,
        videoUrl,
        isPublished: false,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    console.log('📊 Lesson creation result:', { created: !!created, error: createErr?.message })

    if (createErr) {
      console.error('❌ Error creating lesson:', createErr)
      return NextResponse.json({ 
        error: 'Failed to create lesson',
        debug: { supabaseError: createErr.message }
      }, { status: 500 })
    }

    console.log('✅ Lesson created successfully:', created?.id)
    return NextResponse.json({
      success: true,
      lesson: created,
      debug: {
        lessonId: created?.id,
        moduleId,
        title,
        userRole,
        nextOrder: lessonOrder
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error in direct lesson creation:', error)
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

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Direct lesson creation GET endpoint called')
    
    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId')
    
    if (!moduleId) {
      return NextResponse.json({ 
        error: 'Module ID is required',
        usage: 'Add ?moduleId=YOUR_MODULE_ID to the URL'
      }, { status: 400 })
    }

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

    // Check module exists
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId, title')
      .eq('id', moduleId)
      .single()

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

    // Check course permissions for instructors
    if (userRole === 'INSTRUCTOR') {
      const { data: course, error: courseErr } = await supabaseAdmin
        .from('Course')
        .select('id, instructorId, title')
        .eq('id', module.courseId)
        .single()

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

    // Check existing lessons
    const { data: existingLessons, error: lessonsErr } = await supabaseAdmin
      .from('Lesson')
      .select('id, title, order')
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    const nextOrder = existingLessons?.length ? Math.max(...existingLessons.map(l => l.order || 0)) + 1 : 1

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
        canCreateLesson: true
      }
    })

  } catch (error) {
    console.error('❌ Error in direct lesson creation GET:', error)
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
