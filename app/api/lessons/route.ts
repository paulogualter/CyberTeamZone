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

    // Verificar se o módulo existe e permissões
    const { data: module, error: moduleError } = await supabaseAdmin
      .from('Module')
      .select(`
        id,
        courseId,
        course:Course(
          instructorId,
          approvalStatus
        )
      `)
      .eq('id', moduleId)
      .single()

    if (moduleError || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'INSTRUCTOR' && module.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (session.user.role === 'STUDENT' && module.course.approvalStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 })
    }

    const { data: lessons, error } = await supabaseAdmin
      .from('Lesson')
      .select(`
        id,
        title,
        content,
        videoUrl,
        duration,
        order,
        type,
        isPublished,
        moduleId,
        createdAt,
        updatedAt
      `)
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    if (error) {
      console.error('Error fetching lessons:', error)
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      lessons: lessons || []
    })

  } catch (error) {
    console.error('Error in GET /api/lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Criar nova aula
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, videoUrl, duration, moduleId, order, type, isPublished } = body

    if (!title || !moduleId) {
      return NextResponse.json({ error: 'Title and moduleId are required' }, { status: 400 })
    }

    // Verificar se o módulo existe e permissões
    const { data: module, error: moduleError } = await supabaseAdmin
      .from('Module')
      .select(`
        id,
        courseId,
        course:Course(
          instructorId
        )
      `)
      .eq('id', moduleId)
      .single()

    if (moduleError || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    if (session.user.role === 'INSTRUCTOR' && module.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Buscar próximo order se não fornecido
    let lessonOrder = order
    if (!lessonOrder) {
      const { data: lastLesson } = await supabaseAdmin
        .from('Lesson')
        .select('order')
        .eq('moduleId', moduleId)
        .order('order', { ascending: false })
        .limit(1)
        .single()

      lessonOrder = lastLesson ? lastLesson.order + 1 : 1
    }

    const lessonData = {
      title,
      content: content || '',
      videoUrl: videoUrl || null,
      duration: duration || null,
      moduleId,
      order: lessonOrder,
      type: type || 'VIDEO',
      isPublished: isPublished || false
    }

    const { data: lesson, error } = await supabaseAdmin
      .from('Lesson')
      .insert([lessonData])
      .select()
      .single()

    if (error) {
      console.error('Error creating lesson:', error)
      return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      lesson
    })

  } catch (error) {
    console.error('Error in POST /api/lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}