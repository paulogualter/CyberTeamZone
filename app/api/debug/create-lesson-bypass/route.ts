import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Direct lesson creation endpoint called')
    
    const body = await req.json()
    console.log('📝 Request body:', body)

    const { 
      title = 'Test Lesson', 
      description = 'Test Description', 
      content = 'Test Content',
      moduleId = 'module_1760134320837_r7frihu3',
      order,
      duration = 0,
      videoUrl = ''
    } = body

    console.log('📚 Using moduleId:', moduleId)

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

    console.log('🔍 Verifying course exists...')
    
    // Buscar dados do curso separadamente
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', module.courseId)
      .single()

    console.log('📊 Course verification:', { course: !!course, error: courseErr?.message })

    if (courseErr || !course) {
      console.log('❌ Course not found:', courseErr?.message)
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    console.log('🔍 Getting next order...')
    
    // Próxima ordem se não informada
    let lessonOrder = order as number | undefined
    if (!lessonOrder) {
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
    }
    
    console.log('📊 Next order:', lessonOrder)

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
        nextOrder: lessonOrder,
        courseId: module.courseId,
        courseTitle: course?.title
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
    const moduleId = searchParams.get('moduleId') || 'module_1760134320837_r7frihu3'
    
    console.log('📚 Module ID:', moduleId)

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
          moduleId,
          moduleError: moduleErr?.message
        }
      }, { status: 404 })
    }

    // Check course exists
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId, title')
      .eq('id', module.courseId)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ 
        error: 'Course not found',
        debug: {
          moduleId,
          courseId: module.courseId,
          courseError: courseErr?.message
        }
      }, { status: 404 })
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
        moduleId,
        moduleTitle: module.title,
        courseId: module.courseId,
        courseTitle: course.title,
        courseInstructorId: course.instructorId,
        existingLessonsCount: existingLessons?.length || 0,
        existingLessons: existingLessons || [],
        nextOrder,
        canCreateLesson: true,
        note: 'This endpoint bypasses authentication for testing'
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
