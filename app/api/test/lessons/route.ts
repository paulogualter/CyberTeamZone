import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Test lessons endpoint called')
    
    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId')
    
    if (!moduleId) {
      return NextResponse.json({ 
        error: 'Module ID is required'
      }, { status: 400 })
    }

    // Verificar se o módulo existe
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, title, courseId')
      .eq('id', moduleId)
      .single()

    if (moduleErr || !module) {
      return NextResponse.json({ 
        error: 'Module not found',
        debug: moduleErr?.message,
        moduleId: moduleId
      }, { status: 404 })
    }

    // Buscar aulas do módulo
    const { data: lessons, error: lessonsErr } = await supabaseAdmin
      .from('Lesson')
      .select('*')
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    return NextResponse.json({ 
      success: true, 
      lessons: lessons || [],
      debug: {
        moduleId: moduleId,
        module: {
          id: module.id,
          title: module.title,
          courseId: module.courseId
        },
        lessonsCount: lessons?.length || 0,
        lessonsError: lessonsErr?.message
      }
    })

  } catch (error) {
    console.error('❌ Error in test lessons:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Test lessons POST endpoint called')
    
    const body = await req.json()
    const { title, content, type, duration, order, videoUrl, attachment, moduleId } = body

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

    // Criar aula
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
        isPublished: false,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    if (createErr) {
      console.error('Error creating lesson:', createErr)
      return NextResponse.json({ error: 'Failed to create lesson', debug: createErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      lesson: created,
      debug: {
        moduleId: moduleId,
        lessonOrder: lessonOrder,
        lessonId: lessonId
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error in test lessons POST:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('🔍 Test lessons DELETE endpoint called')
    
    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get('id')
    
    if (!lessonId) {
      return NextResponse.json({ 
        error: 'Lesson ID is required'
      }, { status: 400 })
    }

    // Verificar se a aula existe
    const { data: lesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select('id, title, moduleId')
      .eq('id', lessonId)
      .single()

    if (lessonErr || !lesson) {
      return NextResponse.json({ 
        error: 'Lesson not found',
        debug: lessonErr?.message,
        lessonId: lessonId
      }, { status: 404 })
    }

    // Deletar aula
    const { error: deleteErr } = await supabaseAdmin
      .from('Lesson')
      .delete()
      .eq('id', lessonId)

    if (deleteErr) {
      console.error('Error deleting lesson:', deleteErr)
      return NextResponse.json({ error: 'Failed to delete lesson', debug: deleteErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully',
      debug: {
        lessonId: lessonId,
        lessonTitle: lesson.title
      }
    })

  } catch (error) {
    console.error('❌ Error in test lessons DELETE:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    console.log('🔍 Test lessons PUT endpoint called')
    
    const body = await req.json()
    const { id, title, content, type, duration, order, videoUrl, attachment, moduleId, isPublished } = body

    // Validação básica
    if (!id || !title || !content || !type || !moduleId) {
      return NextResponse.json(
        { error: 'ID, title, content, type and moduleId are required' },
        { status: 400 }
      )
    }

    // Verificar se a aula existe
    const { data: existingLesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select('id, title, moduleId')
      .eq('id', id)
      .single()

    if (lessonErr || !existingLesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
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

    const nowIso = new Date().toISOString()

    // Atualizar aula
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('Lesson')
      .update({
        title,
        content,
        type,
        duration: duration || 0,
        order: order || 1,
        videoUrl: videoUrl || null,
        attachment: attachment || null,
        isPublished: isPublished || false,
        updatedAt: nowIso
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateErr) {
      console.error('Error updating lesson:', updateErr)
      return NextResponse.json({ error: 'Failed to update lesson', debug: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      lesson: updated,
      debug: {
        lessonId: id,
        moduleId: moduleId,
        updatedAt: nowIso
      }
    })

  } catch (error) {
    console.error('❌ Error in test lessons PUT:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
