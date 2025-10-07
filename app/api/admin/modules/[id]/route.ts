import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
// Updated: Migrated from Prisma to Supabase

// GET - Buscar módulo específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: module, error: modErr } = await supabaseAdmin
      .from('Module')
      .select('id, title, description, order, isPublished, courseId')
      .eq('id', params.id)
      .maybeSingle()
    if (modErr) throw modErr

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    const { data: lessons } = await supabaseAdmin
      .from('Lesson')
      .select('id, title, order, isPublished, type, duration')
      .eq('moduleId', module.id)
      .order('order', { ascending: true })

    const { data: course } = await supabaseAdmin
      .from('Course')
      .select('id, title')
      .eq('id', module.courseId)
      .maybeSingle()

    return NextResponse.json({ success: true, module: { ...module, lessons: lessons || [], course } })
  } catch (error) {
    console.error('Error fetching module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar módulo
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
    const { title, description, order, isPublished } = body

    const updateData: any = {}
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (order !== undefined) updateData.order = order
    if (isPublished !== undefined) updateData.isPublished = isPublished

    const { data: updatedRows, error: updErr } = await supabaseAdmin
      .from('Module')
      .update(updateData)
      .eq('id', params.id)
      .select('id, title, description, order, isPublished, courseId')
    if (updErr) throw updErr
    const updated = updatedRows?.[0]
    if (!updated) return NextResponse.json({ error: 'Module not found' }, { status: 404 })

    const { data: lessons } = await supabaseAdmin
      .from('Lesson')
      .select('id, title, order, isPublished, type, duration')
      .eq('moduleId', updated.id)
      .order('order', { ascending: true })
    const { data: course } = await supabaseAdmin
      .from('Course')
      .select('id, title')
      .eq('id', updated.courseId)
      .maybeSingle()

    const module = { ...updated, lessons: lessons || [], course }

    return NextResponse.json({ success: true, module })
  } catch (error) {
    console.error('Error updating module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir módulo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if module has lessons
    const { data: lessons } = await supabaseAdmin
      .from('Lesson')
      .select('id')
      .eq('moduleId', params.id)

    if ((lessons?.length || 0) > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete module with lessons. Please delete all lessons first.' 
      }, { status: 400 })
    }

    const { error: delErr } = await supabaseAdmin
      .from('Module')
      .delete()
      .eq('id', params.id)
    if (delErr) throw delErr

    return NextResponse.json({
      success: true,
      message: 'Module deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
