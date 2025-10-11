import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Test modules with simulated session endpoint called')
    
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    
    if (!courseId) {
      return NextResponse.json({ 
        error: 'Course ID is required'
      }, { status: 400 })
    }

    // Simular sessão de instrutor
    const simulatedSession = {
      user: {
        id: 'instructor_1760127691853_omgskmpf', // ID do instrutor do curso
        role: 'INSTRUCTOR'
      }
    }

    // Verificar se o curso pertence ao instrutor
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', courseId)
      .eq('instructorId', simulatedSession.user.id)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ 
        error: 'Course not found or access denied',
        debug: courseErr?.message,
        courseId: courseId,
        simulatedInstructorId: simulatedSession.user.id
      }, { status: 404 })
    }

    // Buscar módulos do curso
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
        simulatedSession: simulatedSession,
        courseId: courseId,
        modulesCount: modules?.length || 0
      }
    })

  } catch (error) {
    console.error('❌ Error in test modules with simulated session:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}