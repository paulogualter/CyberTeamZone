import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Simple lesson creation endpoint called')
    
    const body = await req.json()
    console.log('📝 Request body:', body)

    const { 
      title = 'Nova Aula',
      description = 'Descrição da aula',
      content = 'Conteúdo da aula',
      moduleId = 'module_1760134320837_r7frihu3'
    } = body

    console.log('📚 Creating lesson for module:', moduleId)

    // Verificar se o módulo existe
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', moduleId)
      .single()

    if (moduleErr || !module) {
      console.log('❌ Module not found:', moduleErr?.message)
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    console.log('✅ Module found:', module.id)

    // Buscar próxima ordem
    const { data: lastLesson, error: lastErr } = await supabaseAdmin
      .from('Lesson')
      .select('order')
      .eq('moduleId', moduleId)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = lastLesson?.order ? (Number(lastLesson.order) + 1) : 1
    console.log('📊 Next order:', nextOrder)

    // Criar aula
    const nowIso = new Date().toISOString()
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    
    console.log('🔗 Creating lesson with ID:', lessonId)

    const { data: created, error: createErr } = await supabaseAdmin
      .from('Lesson')
      .insert({
        id: lessonId,
        title,
        description,
        content,
        moduleId,
        order: nextOrder,
        duration: 0,
        videoUrl: '',
        isPublished: false,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    if (createErr) {
      console.error('❌ Error creating lesson:', createErr)
      return NextResponse.json({ 
        error: 'Failed to create lesson',
        details: createErr.message
      }, { status: 500 })
    }

    console.log('✅ Lesson created successfully:', created?.id)
    
    return NextResponse.json({
      success: true,
      lesson: created,
      message: 'Aula criada com sucesso!',
      debug: {
        lessonId: created?.id,
        moduleId,
        title,
        order: nextOrder
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error in simple lesson creation:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Simple lesson creation GET endpoint called')
    
    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId') || 'module_1760134320837_r7frihu3'
    
    console.log('📚 Checking module:', moduleId)

    // Verificar módulo
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, title, courseId')
      .eq('id', moduleId)
      .single()

    if (moduleErr || !module) {
      return NextResponse.json({ 
        error: 'Module not found',
        moduleId,
        details: moduleErr?.message
      }, { status: 404 })
    }

    // Verificar aulas existentes
    const { data: lessons, error: lessonsErr } = await supabaseAdmin
      .from('Lesson')
      .select('id, title, order')
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    const nextOrder = lessons?.length ? Math.max(...lessons.map(l => l.order || 0)) + 1 : 1

    return NextResponse.json({
      success: true,
      module: {
        id: module.id,
        title: module.title,
        courseId: module.courseId
      },
      existingLessons: lessons || [],
      nextOrder,
      canCreateLesson: true,
      message: 'Módulo encontrado e pronto para criar aulas'
    })

  } catch (error) {
    console.error('❌ Error in simple lesson creation GET:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
