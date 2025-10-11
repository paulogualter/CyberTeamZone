import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar aulas de um módulo (para admins)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const userRole = (session.user as any)?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId')

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Buscar aulas do módulo (admins podem ver todas)
    const { data: lessons, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select('*')
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    if (lessonErr) {
      console.error('Error fetching lessons:', lessonErr)
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
    }

    return NextResponse.json({ success: true, lessons: lessons || [] })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar nova aula (para admins)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const userRole = (session.user as any)?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { 
      title, 
      description, 
      content, 
      videoUrl, 
      duration, 
      order, 
      moduleId,
      isPublished = false 
    } = await req.json()

    // Validação básica
    if (!title || !moduleId) {
      return NextResponse.json(
        { error: 'Title and moduleId are required' },
        { status: 400 }
      )
    }

    // Verificar se o módulo existe usando queries separadas
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', moduleId)
      .single()

    if (moduleErr || !module) {
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
      return NextResponse.json(
        { error: 'Course not found' },
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
        description: description || '',
        content: content || '',
        videoUrl: videoUrl || '',
        duration: duration || 0,
        moduleId,
        order: lessonOrder,
        isPublished,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    if (createErr) {
      console.error('Error creating lesson:', createErr)
      return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      lesson: created
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}