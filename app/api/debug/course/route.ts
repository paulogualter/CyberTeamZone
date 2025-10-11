import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug course endpoint called')
    
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
      .select('id, title, instructorId, createdAt')
      .eq('id', courseId)
      .single()

    // Buscar todos os cursos para comparação
    const { data: allCourses, error: allCoursesErr } = await supabaseAdmin
      .from('Course')
      .select('id, title, instructorId')
      .limit(10)

    return NextResponse.json({ 
      debug: {
        requestedCourseId: courseId,
        course: course,
        courseError: courseErr?.message,
        courseExists: !!course,
        allCourses: allCourses || [],
        allCoursesError: allCoursesErr?.message
      }
    })

  } catch (error) {
    console.error('❌ Error in debug course:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
