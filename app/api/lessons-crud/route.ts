import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar aulas de um módulo
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId')

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Verificar se o módulo existe
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', moduleId)
      .single()

    if (moduleErr || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Buscar dados do curso separadamente
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', module.courseId)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verificar permissões
    const userRole = (session.user as any)?.role
    const isAdmin = userRole === 'ADMIN'
    const isInstructor = userRole === 'INSTRUCTOR' && course.instructorId === session.user.id

    if (!isAdmin && !isInstructor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Buscar aulas do módulo
    const { data: lessons, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select('*')
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    if (lessonErr) {
      console.error('Error fetching lessons:', lessonErr)
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      lessons: lessons || [],
      module: {
        id: module.id,
        courseId: module.courseId
      }
    })

  } catch (error) {
    console.error('Error fetching lessons:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}

// POST - Criar nova aula
export async function POST(req: NextRequest) {
  try {
    console.log('📚 Creating new lesson')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar role
    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      console.log('❌ Not authorized')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const rawBody = await req.text()
    console.log('📝 Raw request body:', rawBody)
    
    let requestData
    try {
      requestData = JSON.parse(rawBody)
      console.log('📊 Parsed request data:', JSON.stringify(requestData, null, 2))
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error'
      console.log('❌ JSON parse error:', errorMessage)
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        debug: { rawBody, parseError: errorMessage }
      }, { status: 400 })
    }

    const { 
      title, 
      description, 
      content, 
      videoUrl, 
      duration, 
      order, 
      moduleId,
      type = 'VIDEO',
      isPublished = false 
    } = requestData

    console.log('📝 Extracted data:', { title, moduleId, order, type, isPublished })

    // Validação básica
    if (!title || !moduleId) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Title and moduleId are required' },
        { status: 400 }
      )
    }

    // Verificar se o módulo existe
    console.log('🔍 Verifying module exists...')
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', moduleId)
      .single()

    console.log('📊 Module verification:', { module: !!module, error: moduleErr?.message })

    if (moduleErr || !module) {
      console.log('❌ Module not found:', moduleErr?.message)
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    // Buscar dados do curso separadamente
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', module.courseId)
      .single()

    if (courseErr || !course) {
      console.log('❌ Course not found:', courseErr?.message)
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Verificar permissões específicas para instrutores
    if (userRole === 'INSTRUCTOR' && course.instructorId !== session.user.id) {
      console.log('❌ Instructor not authorized for this course')
      return NextResponse.json(
        { error: 'You can only create lessons for your own courses' },
        { status: 403 }
      )
    }

    // Calcular próxima ordem se não informada
    let lessonOrder = order as number | undefined
    if (!lessonOrder) {
      console.log('🔍 Getting next order...')
      const { data: lastLesson, error: lastErr } = await supabaseAdmin
        .from('Lesson')
        .select('order')
        .eq('moduleId', moduleId)
        .order('order', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (lastErr) {
        console.warn('Could not get last lesson order:', lastErr)
      }
      lessonOrder = lastLesson?.order ? (Number(lastLesson.order) + 1) : 1
    }
    
    console.log('📊 Next order:', lessonOrder)

    // Gerar ID único para a aula
    const nowIso = new Date().toISOString()
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    console.log('🆔 Generated lesson ID:', lessonId)

    // Criar aula
    console.log('🔗 Creating lesson in Supabase...')
    const { data: created, error: createErr } = await supabaseAdmin
      .from('Lesson')
      .insert({
        id: lessonId,
        title,
        content: content || '',
        type: type as any,
        duration: duration || null,
        order: lessonOrder,
        isPublished,
        videoUrl: videoUrl || null,
        attachment: null,
        moduleId,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    console.log('📊 Lesson creation result:', { created: !!created, error: createErr?.message })

    if (createErr) {
      console.error('❌ Error creating lesson:', createErr)
      return NextResponse.json({ 
        error: 'Failed to create lesson',
        debug: { supabaseError: createErr.message }
      }, { status: 500 })
    }

    console.log('✅ Lesson created successfully:', created?.id)
    return NextResponse.json({
      success: true,
      lesson: created,
      debug: {
        lessonId: created?.id,
        moduleId,
        title,
        order: lessonOrder,
        type: type
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating lesson:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}

// PUT - Atualizar aula
export async function PUT(req: NextRequest) {
  try {
    console.log('📝 Updating lesson')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const rawBody = await req.text()
    let requestData
    try {
      requestData = JSON.parse(rawBody)
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error'
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        debug: { parseError: errorMessage }
      }, { status: 400 })
    }

    const { 
      id,
      title, 
      description, 
      content, 
      videoUrl, 
      duration, 
      order, 
      type,
      isPublished 
    } = requestData

    if (!id) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Verificar se a aula existe
    const { data: existingLesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select('id, moduleId')
      .eq('id', id)
      .single()

    if (lessonErr || !existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Buscar dados do módulo e curso separadamente
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', existingLesson.moduleId)
      .single()

    if (moduleErr || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', module.courseId)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verificar permissões específicas para instrutores
    if (userRole === 'INSTRUCTOR' && course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit lessons from your own courses' },
        { status: 403 }
      )
    }

    // Atualizar aula
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl
    if (duration !== undefined) updateData.duration = duration
    if (order !== undefined) updateData.order = order
    if (type !== undefined) updateData.type = type
    if (isPublished !== undefined) updateData.isPublished = isPublished

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('Lesson')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (updateErr) {
      console.error('Error updating lesson:', updateErr)
      return NextResponse.json({ 
        error: 'Failed to update lesson',
        debug: { supabaseError: updateErr.message }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      lesson: updated
    })

  } catch (error) {
    console.error('Error updating lesson:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE - Deletar aula
export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ Deleting lesson')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get('id')

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Verificar se a aula existe
    const { data: existingLesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select('id, moduleId')
      .eq('id', lessonId)
      .single()

    if (lessonErr || !existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Buscar dados do módulo e curso separadamente
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', existingLesson.moduleId)
      .single()

    if (moduleErr || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', module.courseId)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verificar permissões específicas para instrutores
    if (userRole === 'INSTRUCTOR' && course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete lessons from your own courses' },
        { status: 403 }
      )
    }

    // Deletar aula
    const { error: deleteErr } = await supabaseAdmin
      .from('Lesson')
      .delete()
      .eq('id', lessonId)

    if (deleteErr) {
      console.error('Error deleting lesson:', deleteErr)
      return NextResponse.json({ 
        error: 'Failed to delete lesson',
        debug: { supabaseError: deleteErr.message }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting lesson:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}
