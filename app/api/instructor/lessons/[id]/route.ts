import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// PUT - Atualizar aula
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é instrutor
    const userRole = (session.user as any)?.role
    if (userRole !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, content, type, duration, order, videoUrl, attachment } = await req.json()

    // Verificar se a aula pertence ao instrutor
    const { data: existingLesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select(`
        id,
        module:Module(
          course:Course(id, instructorId)
        )
      `)
      .eq('id', params.id)
      .eq('module.course.instructorId', session.user.id)
      .single()

    if (lessonErr || !existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Atualizar aula
    const { data: updatedLesson, error: updateErr } = await supabaseAdmin
      .from('Lesson')
      .update({
        ...(title && { title }),
        ...(content && { content }),
        ...(type && { type }),
        ...(duration !== undefined && { duration }),
        ...(order !== undefined && { order }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(attachment !== undefined && { attachment }),
        updatedAt: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateErr) {
      console.error('Error updating lesson:', updateErr)
      return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      lesson: updatedLesson
    })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir aula
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é instrutor
    const userRole = (session.user as any)?.role
    if (userRole !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verificar se a aula pertence ao instrutor
    const { data: existingLesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select(`
        id,
        module:Module(
          course:Course(id, instructorId)
        )
      `)
      .eq('id', params.id)
      .eq('module.course.instructorId', session.user.id)
      .single()

    if (lessonErr || !existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Excluir aula
    const { error: deleteErr } = await supabaseAdmin
      .from('Lesson')
      .delete()
      .eq('id', params.id)

    if (deleteErr) {
      console.error('Error deleting lesson:', deleteErr)
      return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
