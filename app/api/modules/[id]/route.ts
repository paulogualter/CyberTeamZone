import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Buscar módulo específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moduleId = params.id

    const { data: module, error } = await supabaseAdmin
      .from('Module')
      .select(`
        id,
        title,
        description,
        order,
        courseId,
        createdAt,
        updatedAt,
        course:Course(
          instructorId,
          approvalStatus
        ),
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
      .eq('id', moduleId)
      .single()

    if (error || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'INSTRUCTOR' && module.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (session.user.role === 'STUDENT' && module.course.approvalStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 })
    }

    // Ordenar aulas
    const orderedModule = {
      ...module,
      lessons: (module.lessons || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    }

    return NextResponse.json({
      success: true,
      module: orderedModule
    })

  } catch (error) {
    console.error('Error in GET /api/modules/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Atualizar módulo
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moduleId = params.id
    const body = await req.json()

    // Verificar se o módulo existe
    const { data: existingModule, error: fetchError } = await supabaseAdmin
      .from('Module')
      .select(`
        id,
        course:Course(
          instructorId
        )
      `)
      .eq('id', moduleId)
      .single()

    if (fetchError || !existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'INSTRUCTOR' && existingModule.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: module, error } = await supabaseAdmin
      .from('Module')
      .update({
        ...body,
        updatedAt: new Date().toISOString()
      })
      .eq('id', moduleId)
      .select()
      .single()

    if (error) {
      console.error('Error updating module:', error)
      return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      module
    })

  } catch (error) {
    console.error('Error in PUT /api/modules/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Deletar módulo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moduleId = params.id

    // Verificar se o módulo existe
    const { data: existingModule, error: fetchError } = await supabaseAdmin
      .from('Module')
      .select(`
        id,
        course:Course(
          instructorId
        )
      `)
      .eq('id', moduleId)
      .single()

    if (fetchError || !existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'INSTRUCTOR' && existingModule.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('Module')
      .delete()
      .eq('id', moduleId)

    if (error) {
      console.error('Error deleting module:', error)
      return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Module deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/modules/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}