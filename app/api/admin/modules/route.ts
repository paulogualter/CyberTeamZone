import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar módulos de um curso (para admins)
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
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Buscar módulos do curso (admins podem ver todos)
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select(`
        *,
        lessons:Lesson(*),
        course:Course(id, title, instructorId, instructor:User(name, email))
      `)
      .eq('courseId', courseId)
      .order('order', { ascending: true })

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

// POST - Criar novo módulo (para admins)
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

    const { title, description, order, courseId } = await req.json()

    // Validação básica
    if (!title || !courseId) {
      return NextResponse.json(
        { error: 'Title and courseId are required' },
        { status: 400 }
      )
    }

    // Verificar se o curso existe
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', courseId)
      .single()

    if (courseErr || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
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

    // Criar módulo
    const { data: created, error: createErr } = await supabaseAdmin
      .from('Module')
      .insert({
        id: moduleId,
        title,
        description: description || '',
        courseId,
        order: moduleOrder,
        isPublished: false,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*, lessons:Lesson(*)')
      .single()

    if (createErr) {
      console.error('Error creating module:', createErr)
      return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      module: created
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}