import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// PUT - Atualizar módulo
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

    const { title, description, order } = await req.json()

    // Verificar se o módulo pertence ao instrutor
    const { data: existingModule, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select(`
        id,
        course:Course(id, instructorId)
      `)
      .eq('id', params.id)
      .eq('course.instructorId', session.user.id)
      .single()

    if (moduleErr || !existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Atualizar módulo
    const { data: updatedModule, error: updateErr } = await supabaseAdmin
      .from('Module')
      .update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        updatedAt: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateErr) {
      console.error('Error updating module:', updateErr)
      return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      module: updatedModule
    })
  } catch (error) {
    console.error('Error updating module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir módulo
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

    // Verificar se o módulo pertence ao instrutor
    const { data: existingModule, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select(`
        id,
        course:Course(id, instructorId)
      `)
      .eq('id', params.id)
      .eq('course.instructorId', session.user.id)
      .single()

    if (moduleErr || !existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Excluir módulo (cascade delete lessons via foreign key)
    const { error: deleteErr } = await supabaseAdmin
      .from('Module')
      .delete()
      .eq('id', params.id)

    if (deleteErr) {
      console.error('Error deleting module:', deleteErr)
      return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
    }

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
