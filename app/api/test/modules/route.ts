import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Simple test modules endpoint called')
    
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    
    if (!courseId) {
      return NextResponse.json({ 
        error: 'Course ID is required'
      }, { status: 400 })
    }

    // Verificar se o curso existe
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, title, instructorId')
      .eq('id', courseId)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ 
        error: 'Course not found',
        debug: courseErr?.message,
        courseId: courseId
      }, { status: 404 })
    }

    // Buscar módulos do curso
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select('*')
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    return NextResponse.json({ 
      success: true, 
      debug: {
        courseId: courseId,
        course: {
          id: course.id,
          title: course.title,
          instructorId: course.instructorId
        },
        modules: modules || [],
        modulesCount: modules?.length || 0,
        modulesError: modErr?.message
      },
      modules: modules || []
    })

  } catch (error) {
    console.error('❌ Error in simple test modules:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}