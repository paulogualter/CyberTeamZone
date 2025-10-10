import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// PUT - Atualizar aula (para admins)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
      isPublished 
    } = await req.json()

    // Verificar se a aula existe
    const { data: existingLesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select(`
        id,
        module:Module(id, title, courseId, course:Course(id, title, instructorId, instructor:User(name, email)))
      `)
      .eq('id', params.id)
      .single()

    if (lessonErr || !existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Atualizar aula
    const { data: updatedLesson, error: updateErr } = await supabaseAdmin
      .from('Lesson')
      .update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(duration !== undefined && { duration }),
        ...(order !== undefined && { order }),
        ...(isPublished !== undefined && { isPublished }),
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

// DELETE - Excluir aula (para admins)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Verificar se a aula existe
    const { data: existingLesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select(`
        id,
        module:Module(id, title, courseId, course:Course(id, title, instructorId, instructor:User(name, email)))
      `)
      .eq('id', params.id)
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