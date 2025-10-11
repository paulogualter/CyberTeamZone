import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Auth test endpoint called')
    
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

    // Buscar módulos do curso (sem verificação de instrutor)
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select(`
        *,
        lessons:Lesson(*)
      `)
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    if (modErr) {
      console.error('❌ Error fetching modules:', modErr)
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      modules: modules || [],
      debug: {
        courseId: courseId,
        course: {
          id: course.id,
          title: course.title,
          instructorId: course.instructorId
        },
        modulesCount: modules?.length || 0,
        note: 'This endpoint bypasses instructor authentication for testing'
      }
    })

  } catch (error) {
    console.error('❌ Error in auth test:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}