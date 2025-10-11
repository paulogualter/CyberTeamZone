import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Simple lesson creation endpoint called')
    
    const body = await req.json()
    console.log('📝 Simple Request body:', JSON.stringify(body, null, 2))
    
    const { title, content, type, duration, order, videoUrl, attachment, moduleId, isPublished } = body
    
    // Validação básica
    if (!title || !content || !type || !moduleId) {
      return NextResponse.json(
        { error: 'Title, content, type and moduleId are required' },
        { status: 400 }
      )
    }

    // Verificar se o módulo existe
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, title, courseId')
      .eq('id', moduleId)
      .single()

    if (moduleErr || !module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    // Próxima ordem se não informada
    let lessonOrder = order as number | undefined
    if (!lessonOrder) {
      const { data: last, error: lastErr } = await supabaseAdmin
        .from('Lesson')
        .select('order')
        .eq('moduleId', moduleId)
        .order('order', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (lastErr) {
        console.warn('Could not get last lesson order:', lastErr)
      }
      lessonOrder = last?.order ? (Number(last.order) + 1) : 1
    }

    const nowIso = new Date().toISOString()
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    // SEMPRE salvar como publicado para teste
    const { data: created, error: createErr } = await supabaseAdmin
      .from('Lesson')
      .insert({
        id: lessonId,
        title,
        content,
        type,
        duration: duration || 0,
        order: lessonOrder,
        videoUrl: videoUrl || null,
        attachment: attachment || null,
        moduleId,
        isPublished: true, // SEMPRE TRUE para teste
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    if (createErr) {
      console.error('Error creating lesson:', createErr)
      return NextResponse.json({ error: 'Failed to create lesson', debug: createErr.message }, { status: 500 })
    }

    console.log('✅ Simple lesson created successfully:', {
      lessonId: lessonId,
      title: title,
      isPublished: true,
      videoUrl: videoUrl ? 'HAS_VIDEO' : 'NO_VIDEO'
    })

    return NextResponse.json({
      success: true,
      lesson: created,
      debug: {
        moduleId: moduleId,
        lessonOrder: lessonOrder,
        lessonId: lessonId,
        forcedPublished: true,
        videoUrlProvided: !!videoUrl
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error in simple lesson creation:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
