import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Teste sem autenticação para verificar se o problema é de auth ou lógica
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Test modules endpoint called')
    
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    console.log('📚 Course ID:', courseId)

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    console.log('🔗 Fetching modules from Supabase...')
    
    // Buscar módulos do curso sem verificação de permissões
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select(`
        *,
        lessons:Lesson(*),
        course:Course(id, title, instructorId)
      `)
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    console.log('📊 Supabase result:', { modules: modules?.length || 0, error: modErr?.message })

    if (modErr) {
      console.error('❌ Error fetching modules:', modErr)
      return NextResponse.json({ 
        error: 'Failed to fetch modules',
        debug: { supabaseError: modErr.message }
      }, { status: 500 })
    }

    console.log('✅ Modules fetched successfully:', modules?.length || 0)
    return NextResponse.json({ 
      success: true, 
      modules: modules || [],
      debug: {
        courseId,
        modulesCount: modules?.length || 0,
        modules: modules?.map(m => ({ id: m.id, title: m.title, courseId: m.courseId }))
      }
    })
  } catch (error) {
    console.error('❌ Error in test modules GET:', error)
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
