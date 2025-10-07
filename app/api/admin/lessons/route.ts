import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar aulas de um módulo
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId')

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    const { data: lessons, error: lessonsErr } = await supabaseAdmin
      .from('Lesson')
      .select(`
        *,
        module:Module(id,title, course:Course(id,title))
      `)
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    if (lessonsErr) {
      console.error('Error fetching lessons:', lessonsErr)
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

// POST - Criar nova aula
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      title, 
      content, 
      type, 
      duration, 
      moduleId, 
      order, 
      isPublished,
      videoUrl, 
      attachment 
    } = body

    if (!title || !content || !type || !moduleId) {
      return NextResponse.json({ 
        error: 'Title, content, type, and moduleId are required' 
      }, { status: 400 })
    }

    // Próxima ordem se não informado
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

    const { data: created, error: createErr } = await supabaseAdmin
      .from('Lesson')
      .insert({
        id: lessonId,
        title,
        content,
        type,
        duration: duration || null,
        moduleId,
        order: lessonOrder,
        isPublished: Boolean(isPublished) || false,
        videoUrl: videoUrl || null,
        attachment: attachment || null,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*, module:Module(id,title, course:Course(id,title))')
      .single()

    if (createErr) {
      console.error('Error creating lesson:', createErr)
      return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
    }

    return NextResponse.json({ success: true, lesson: created })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
