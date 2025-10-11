import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Test admin module endpoint called')
    
    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId') || 'module_1760134320837_r7frihu3'
    
    console.log('📚 Module ID:', moduleId)

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    console.log('🔗 Fetching module from Supabase...')
    
    // Buscar módulo específico usando queries separadas
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('*')
      .eq('id', moduleId)
      .single()

    console.log('📊 Supabase result:', { module: !!module, error: moduleErr?.message })

    if (moduleErr) {
      console.error('❌ Error fetching module:', moduleErr)
      return NextResponse.json({ 
        error: 'Failed to fetch module',
        debug: { supabaseError: moduleErr.message }
      }, { status: 500 })
    }

    if (!module) {
      console.log('❌ Module not found')
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Buscar aulas do módulo separadamente
    const { data: lessons, error: lessonsErr } = await supabaseAdmin
      .from('Lesson')
      .select('*')
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    if (lessonsErr) {
      console.warn('⚠️ Error fetching lessons:', lessonsErr)
    }

    // Buscar dados do curso separadamente
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, title, instructorId')
      .eq('id', module.courseId)
      .single()

    if (courseErr) {
      console.warn('⚠️ Error fetching course:', courseErr)
    }

    // Buscar dados do instrutor separadamente
    let instructor = null
    if (course?.instructorId) {
      const { data: instructorData, error: instructorErr } = await supabaseAdmin
        .from('User')
        .select('name, email')
        .eq('id', course.instructorId)
        .single()

      if (instructorErr) {
        console.warn('⚠️ Error fetching instructor:', instructorErr)
      } else {
        instructor = instructorData
      }
    }

    // Montar resposta com dados combinados
    const moduleWithRelations = {
      ...module,
      lessons: lessons || [],
      course: course ? {
        ...course,
        instructor
      } : null
    }

    console.log('✅ Module fetched successfully:', module.id)
    return NextResponse.json({ 
      success: true, 
      module: moduleWithRelations,
      debug: {
        moduleId,
        lessonsCount: lessons?.length || 0,
        courseTitle: course?.title,
        instructorName: instructor?.name,
        testMode: true,
        note: 'This endpoint bypasses authentication for testing'
      }
    })

  } catch (error) {
    console.error('❌ Error in test admin module:', error)
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
