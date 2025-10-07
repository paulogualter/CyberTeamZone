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
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: course, error } = await supabaseAdmin
      .from('Course')
      .select('*, category:Category(*), modules:Module(*, lessons:Lesson(*))')
      .eq('id', params.id)
      .single()

    if (error || !course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      course
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar curso
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      shortDescription,
      description,
      price,
      escudosPrice,
      difficulty,
      duration,
      categoryId,
      instructorId,
      coverImage,
      isPublished,
      status
    } = body

    // Verificar se o curso existe
    const { data: existingCourse } = await supabaseAdmin
      .from('Course')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a categoria existe (se fornecida)
    if (categoryId) {
      const { data: category } = await supabaseAdmin
        .from('Category')
        .select('id')
        .eq('id', categoryId)
        .single()

      if (!category) {
        return NextResponse.json(
          { error: 'Categoria não encontrada' },
          { status: 400 }
        )
      }
    }

    // Verificar se o instrutor existe (se fornecido)
    if (instructorId) {
      const { data: instructor } = await supabaseAdmin
        .from('Instructor')
        .select('id')
        .eq('id', instructorId)
        .single()

      if (!instructor) {
        return NextResponse.json(
          { error: 'Instrutor não encontrado' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (escudosPrice !== undefined) updateData.escudosPrice = parseInt(escudosPrice)
    if (difficulty) updateData.difficulty = difficulty
    if (body.courseType) updateData.courseType = body.courseType
    if (duration !== undefined) updateData.duration = parseInt(duration)
    if (categoryId) updateData.categoryId = categoryId
    if (instructorId) updateData.instructorId = instructorId
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (isPublished !== undefined) updateData.isPublished = isPublished
    // Normalize startDate for ONLINE/HYBRID, otherwise null
    if (body.courseType === 'ONLINE' || body.courseType === 'HYBRID') {
      if (body.startDate) {
        try {
          updateData.startDate = new Date(body.startDate).toISOString()
        } catch {
          updateData.startDate = null
        }
      }
    } else if (body.courseType === 'RECORDED') {
      updateData.startDate = null
    }
    if (status) updateData.status = status
    updateData.updatedAt = new Date().toISOString()

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('Course')
      .update(updateData)
      .eq('id', params.id)
      .select('*, category:Category(*), instructor:Instructor(*)')
      .single()
    if (updErr) {
      console.error('Error updating course:', updErr)
      return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      course: updated
    })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir curso
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se o curso existe
    const { data: existingCourse } = await supabaseAdmin
      .from('Course')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se há matrículas ativas
    const { data: enrollments } = await supabaseAdmin
      .from('Enrollment')
      .select('id')
      .eq('courseId', params.id)

    if ((enrollments?.length || 0) > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir curso com matrículas ativas' },
        { status: 400 }
      )
    }

    // Excluir curso (cascade delete para módulos e aulas)
    const { error: delErr } = await supabaseAdmin
      .from('Course')
      .delete()
      .eq('id', params.id)
    if (delErr) {
      console.error('Error deleting course:', delErr)
      return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Curso excluído com sucesso'
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
