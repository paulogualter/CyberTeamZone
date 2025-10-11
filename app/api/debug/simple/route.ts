import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Debug simples sem autenticação para produção
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Simple debug endpoint called')
    
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    console.log('📚 Course ID:', courseId)

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Verificar o curso
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, title, instructorId')
      .eq('id', courseId)
      .single()

    console.log('📊 Course data:', { course, error: courseErr?.message })

    // Verificar módulos do curso
    const { data: modules, error: modulesErr } = await supabaseAdmin
      .from('Module')
      .select('id, title, courseId, isPublished, order')
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    console.log('📚 Modules data:', { modules: modules?.length || 0, error: modulesErr?.message })

    return NextResponse.json({
      success: true,
      debug: {
        courseId,
        course: {
          data: course,
          error: courseErr?.message
        },
        modules: {
          count: modules?.length || 0,
          data: modules,
          error: modulesErr?.message
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Error in simple debug:', error)
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
