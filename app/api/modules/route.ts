import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar módulos de um curso
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Verificar se o curso existe e permissões
    const { data: course, error: courseError } = await supabaseAdmin
      .from('Course')
      .select('instructorId, approvalStatus')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'INSTRUCTOR' && course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (session.user.role === 'STUDENT' && course.approvalStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 })
    }

    const { data: modules, error } = await supabaseAdmin
      .from('Module')
      .select(`
        id,
        title,
        description,
        order,
        courseId,
        createdAt,
        updatedAt,
        lessons:Lesson(
          id,
          title,
          content,
          videoUrl,
          duration,
          order,
          type,
          isPublished,
          createdAt
        )
      `)
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    if (error) {
      console.error('Error fetching modules:', error)
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
    }

    // Ordenar aulas dentro de cada módulo
    const orderedModules = modules?.map(module => ({
      ...module,
      lessons: (module.lessons || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    })) || []

    return NextResponse.json({
      success: true,
      modules: orderedModules
    })

  } catch (error) {
    console.error('Error in GET /api/modules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Criar novo módulo
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
    const { title, description, courseId, order } = body

    if (!title || !courseId) {
      return NextResponse.json({ error: 'Title and courseId are required' }, { status: 400 })
    }

    // Verificar se o curso existe e permissões
    const { data: course, error: courseError } = await supabaseAdmin
      .from('Course')
      .select('instructorId')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (session.user.role === 'INSTRUCTOR' && course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Buscar próximo order se não fornecido
    let moduleOrder = order
    if (!moduleOrder) {
      const { data: lastModule } = await supabaseAdmin
        .from('Module')
        .select('order')
        .eq('courseId', courseId)
        .order('order', { ascending: false })
        .limit(1)
        .single()

      moduleOrder = lastModule ? lastModule.order + 1 : 1
    }

    const moduleData = {
      title,
      description: description || '',
      courseId,
      order: moduleOrder
    }

    const { data: module, error } = await supabaseAdmin
      .from('Module')
      .insert([moduleData])
      .select()
      .single()

    if (error) {
      console.error('Error creating module:', error)
      return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      module
    })

  } catch (error) {
    console.error('Error in POST /api/modules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}