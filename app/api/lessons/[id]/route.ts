import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Buscar aula específica
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lessonId = params.id

    const { data: lesson, error } = await supabaseAdmin
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
        updatedAt,
        module:Module(
          id,
          courseId,
          course:Course(
            instructorId,
            approvalStatus
          )
        )
      `)
      .eq('id', lessonId)
      .single()

    if (error || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'INSTRUCTOR' && lesson.module.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (session.user.role === 'STUDENT' && lesson.module.course.approvalStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      lesson
    })

  } catch (error) {
    console.error('Error in GET /api/lessons/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Atualizar aula
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lessonId = params.id
    const body = await req.json()

    // Verificar se a aula existe
    const { data: existingLesson, error: fetchError } = await supabaseAdmin
      .from('Lesson')
      .select(`
        id,
        module:Module(
          course:Course(
            instructorId
          )
        )
      `)
      .eq('id', lessonId)
      .single()

    if (fetchError || !existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'INSTRUCTOR' && existingLesson.module.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: lesson, error } = await supabaseAdmin
      .from('Lesson')
      .update({
        ...body,
        updatedAt: new Date().toISOString()
      })
      .eq('id', lessonId)
      .select()
      .single()

    if (error) {
      console.error('Error updating lesson:', error)
      return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      lesson
    })

  } catch (error) {
    console.error('Error in PUT /api/lessons/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Deletar aula
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lessonId = params.id

    // Verificar se a aula existe
    const { data: existingLesson, error: fetchError } = await supabaseAdmin
      .from('Lesson')
      .select(`
        id,
        module:Module(
          course:Course(
            instructorId
          )
        )
      `)
      .eq('id', lessonId)
      .single()

    if (fetchError || !existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'INSTRUCTOR' && existingLesson.module.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('Lesson')
      .delete()
      .eq('id', lessonId)

    if (error) {
      console.error('Error deleting lesson:', error)
      return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/lessons/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}