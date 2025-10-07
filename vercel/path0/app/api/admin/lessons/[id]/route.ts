import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
// Updated: Migrated from Prisma to Supabase

// GET - Buscar aula específica
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar lesson com join manual
    const { data: lesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select('id, title, content, type, duration, order, isPublished, videoUrl, attachment, moduleId')
      .eq('id', params.id)
      .maybeSingle()
    if (lessonErr) throw lessonErr

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Buscar dados do módulo e curso
    const { data: moduleData } = await supabaseAdmin
      .from('Module')
      .select('id, title, courseId')
      .eq('id', lesson.moduleId)
      .maybeSingle()
    let courseInfo: any = null
    if (moduleData?.courseId) {
      const { data: course } = await supabaseAdmin
        .from('Course')
        .select('id, title')
        .eq('id', moduleData.courseId)
        .maybeSingle()
      if (course) courseInfo = { id: course.id, title: course.title }
    }

    return NextResponse.json({ success: true, lesson: { ...lesson, module: moduleData ? { id: moduleData.id, title: moduleData.title, course: courseInfo } : null } })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar aula
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
      content, 
      type, 
      duration, 
      order, 
      isPublished, 
      videoUrl, 
      attachment 
    } = body

    const updateData: any = {}
    if (title) updateData.title = title
    if (content) updateData.content = content
    if (type) updateData.type = type
    if (duration !== undefined) updateData.duration = duration
    if (order !== undefined) updateData.order = order
    if (isPublished !== undefined) updateData.isPublished = isPublished
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl
    if (attachment !== undefined) updateData.attachment = attachment

    const { data: updatedRows, error: updErr } = await supabaseAdmin
      .from('Lesson')
      .update(updateData)
      .eq('id', params.id)
      .select('id, title, content, type, duration, order, isPublished, videoUrl, attachment, moduleId')
    if (updErr) throw updErr
    const updated = updatedRows?.[0]
    if (!updated) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

    const { data: moduleData } = await supabaseAdmin
      .from('Module')
      .select('id, title, courseId')
      .eq('id', updated.moduleId)
      .maybeSingle()
    let courseInfo: any = null
    if (moduleData?.courseId) {
      const { data: course } = await supabaseAdmin
        .from('Course')
        .select('id, title')
        .eq('id', moduleData.courseId)
        .maybeSingle()
      if (course) courseInfo = { id: course.id, title: course.title }
    }

    const lesson = { ...updated, module: moduleData ? { id: moduleData.id, title: moduleData.title, course: courseInfo } : null }

    return NextResponse.json({ success: true, lesson })

    return NextResponse.json({
      success: true,
      lesson
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
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: delErr } = await supabaseAdmin
      .from('Lesson')
      .delete()
      .eq('id', params.id)
    if (delErr) throw delErr

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
