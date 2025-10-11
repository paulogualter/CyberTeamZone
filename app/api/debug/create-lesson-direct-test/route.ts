import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Direct lesson creation test')
    
    const { title = 'Teste Direto', moduleId = 'module_1760134320837_r7frihu3' } = await req.json()
    
    console.log('📝 Creating lesson:', { title, moduleId })

    // Check module exists
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', moduleId)
      .single()

    if (moduleErr || !module) {
      return NextResponse.json({ 
        error: 'Module not found',
        debug: { moduleErr: moduleErr?.message }
      }, { status: 404 })
    }

    // Get next order
    const { data: lastLesson, error: lastErr } = await supabaseAdmin
      .from('Lesson')
      .select('order')
      .eq('moduleId', moduleId)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = lastLesson?.order ? (Number(lastLesson.order) + 1) : 1

    // Create lesson
    const nowIso = new Date().toISOString()
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    
    const { data: created, error: createErr } = await supabaseAdmin
      .from('Lesson')
      .insert({
        id: lessonId,
        title,
        description: 'Aula criada via teste direto',
        content: 'Conteúdo da aula',
        videoUrl: '',
        duration: 0,
        moduleId,
        order: nextOrder,
        isPublished: false,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    if (createErr) {
      console.error('❌ Create error:', createErr)
      return NextResponse.json({ 
        error: 'Failed to create lesson',
        debug: { supabaseError: createErr.message }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      lesson: created,
      debug: {
        lessonId: created?.id,
        moduleId,
        title,
        order: nextOrder
      }
    })

  } catch (error) {
    console.error('❌ Direct test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      debug: {
        error: error.message,
        stack: error.stack
      }
    }, { status: 500 })
  }
}
