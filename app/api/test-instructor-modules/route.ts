import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Test instructor modules endpoint called')
    
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    
    if (!courseId) {
      return NextResponse.json({ 
        error: 'Course ID is required'
      }, { status: 400 })
    }

    // Simular um instrutor para teste
    const simulatedInstructorId = 'user_1759784766958_Imeujhddh' // ID do instrutor conhecido

    // Verificar se o curso existe e pertence ao instrutor
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, title, instructorId')
      .eq('id', courseId)
      .single()

    console.log('📚 Course query result:', {
      course: course,
      error: courseErr?.message,
      courseExists: !!course
    })

    if (courseErr || !course) {
      return NextResponse.json({ 
        error: 'Course not found',
        debug: courseErr?.message,
        courseId: courseId
      }, { status: 404 })
    }

    if (course.instructorId !== simulatedInstructorId) {
      return NextResponse.json({ 
        error: 'Access denied',
        debug: `Course instructorId (${course.instructorId}) does not match simulated instructorId (${simulatedInstructorId})`,
        courseId: courseId,
        courseTitle: course.title
      }, { status: 403 })
    }

    // Buscar módulos do curso
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select('*')
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    console.log('📚 Modules query result:', {
      modules: modules,
      error: modErr?.message,
      modulesCount: modules?.length || 0
    })

    return NextResponse.json({ 
      success: true, 
      debug: {
        simulatedInstructorId: simulatedInstructorId,
        course: {
          id: course.id,
          title: course.title,
          instructorId: course.instructorId
        },
        modules: modules || [],
        modulesCount: modules?.length || 0
      },
      modules: modules || []
    })

  } catch (error) {
    console.error('❌ Error in test instructor modules:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}