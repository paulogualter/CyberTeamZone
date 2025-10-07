import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar módulos de um curso
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Buscar módulos com lições (ordenadas) e info mínima do curso
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select(`
        *,
        lessons:Lesson(*),
        course:Course(id,title)
      `)
      .eq('courseId', courseId)
      .order('order', { ascending: true })
      .order('order', { ascending: true, foreignTable: 'Lesson' })

    if (modErr) {
      console.error('Error fetching modules:', modErr)
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
    }

    return NextResponse.json({ success: true, modules: modules || [] })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar novo módulo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, courseId, order, isPublished } = body

    if (!title || !courseId) {
      return NextResponse.json({ error: 'Title and courseId are required' }, { status: 400 })
    }

    // Verificar curso existente
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id,title')
      .eq('id', courseId)
      .single()
    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Próxima ordem se não informada
    let moduleOrder = order as number | undefined
    if (!moduleOrder) {
      const { data: last, error: lastErr } = await supabaseAdmin
        .from('Module')
        .select('order')
        .eq('courseId', courseId)
        .order('order', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (lastErr) {
        console.warn('Could not get last module order:', lastErr)
      }
      moduleOrder = last?.order ? (Number(last.order) + 1) : 1
    }

    const nowIso = new Date().toISOString()
    const moduleId = `module_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    const { data: created, error: createErr } = await supabaseAdmin
      .from('Module')
      .insert({
        id: moduleId,
        title,
        description: description || '',
        courseId,
        order: moduleOrder,
        isPublished: Boolean(isPublished) || false,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*, lessons:Lesson(*), course:Course(id,title)')
      .single()

    if (createErr) {
      console.error('Error creating module:', createErr)
      return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
    }

    return NextResponse.json({ success: true, module: created })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
