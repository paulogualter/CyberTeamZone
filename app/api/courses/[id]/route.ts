import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Buscar curso específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courseId = params.id

    const { data: course, error } = await supabaseAdmin
      .from('Course')
      .select(`
        id,
        title,
        description,
        shortDescription,
        price,
        coverImage,
        approvalStatus,
        instructorId,
        createdAt,
        updatedAt,
        modules:Module(
          id,
          title,
          order,
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
        )
      `)
      .eq('id', courseId)
      .single()

    if (error || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'STUDENT') {
      // Estudante só pode ver cursos aprovados e matriculados
      if (course.approvalStatus !== 'APPROVED') {
        return NextResponse.json({ error: 'Course not available' }, { status: 403 })
      }
      
      // Verificar matrícula
      const { data: enrollment } = await supabaseAdmin
        .from('UserCourseEnrollment')
        .select('id')
        .eq('userId', session.user.id)
        .eq('courseId', courseId)
        .single()

      if (!enrollment) {
        return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
      }
    } else if (session.user.role === 'INSTRUCTOR') {
      // Instrutor só pode ver seus próprios cursos
      if (course.instructorId !== session.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Ordenar módulos e aulas
    const orderedCourse = {
      ...course,
      modules: (course.modules || []).map((module: any) => ({
        ...module,
        lessons: (module.lessons || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    }

    return NextResponse.json({
      success: true,
      course: orderedCourse
    })

  } catch (error) {
    console.error('Error in GET /api/courses/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Atualizar curso
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courseId = params.id
    const body = await req.json()

    // Verificar se o curso existe
    const { data: existingCourse, error: fetchError } = await supabaseAdmin
      .from('Course')
      .select('instructorId')
      .eq('id', courseId)
      .single()

    if (fetchError || !existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'INSTRUCTOR' && existingCourse.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: course, error } = await supabaseAdmin
      .from('Course')
      .update({
        ...body,
        updatedAt: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single()

    if (error) {
      console.error('Error updating course:', error)
      return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      course
    })

  } catch (error) {
    console.error('Error in PUT /api/courses/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Deletar curso
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courseId = params.id

    // Verificar se o curso existe
    const { data: existingCourse, error: fetchError } = await supabaseAdmin
      .from('Course')
      .select('instructorId')
      .eq('id', courseId)
      .single()

    if (fetchError || !existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === 'INSTRUCTOR' && existingCourse.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('Course')
      .delete()
      .eq('id', courseId)

    if (error) {
      console.error('Error deleting course:', error)
      return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/courses/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
