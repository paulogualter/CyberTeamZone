import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Buscar módulo específico (para admins)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 Admin module GET endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (userRole !== 'ADMIN') {
      console.log('❌ Not an admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const moduleId = params.id
    console.log('📚 Module ID:', moduleId)

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    console.log('🔗 Fetching module from Supabase...')
    
    // Buscar módulo específico
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select(`
        *,
        lessons:Lesson(*),
        course:Course(id, title, instructorId, instructor:User(name, email))
      `)
      .eq('id', moduleId)
      .single()

    console.log('📊 Supabase result:', { module: !!module, error: moduleErr?.message })

    if (moduleErr) {
      console.error('❌ Error fetching module:', moduleErr)
      return NextResponse.json({ 
        error: 'Failed to fetch module',
        debug: { supabaseError: moduleErr.message }
      }, { status: 500 })
    }

    if (!module) {
      console.log('❌ Module not found')
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    console.log('✅ Module fetched successfully:', module.id)
    return NextResponse.json({ 
      success: true, 
      module,
      debug: {
        moduleId,
        lessonsCount: module.lessons?.length || 0,
        courseTitle: module.course?.title
      }
    })
  } catch (error) {
    console.error('❌ Error in admin module GET:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}

// PUT - Atualizar módulo (para admins)
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

    const { title, description, order, isPublished } = await req.json()

    // Verificar se o módulo existe usando queries separadas
    const { data: existingModule, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', params.id)
      .single()

    if (moduleErr || !existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Buscar dados do curso separadamente
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, title, instructorId')
      .eq('id', existingModule.courseId)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Atualizar módulo
    const { data: updatedModule, error: updateErr } = await supabaseAdmin
      .from('Module')
      .update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(isPublished !== undefined && { isPublished }),
        updatedAt: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*, lessons:Lesson(*)')
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

// DELETE - Excluir módulo (para admins)
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

    // Verificar se o módulo existe usando queries separadas
    const { data: existingModule, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', params.id)
      .single()

    if (moduleErr || !existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Buscar dados do curso separadamente
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, title, instructorId')
      .eq('id', existingModule.courseId)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
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