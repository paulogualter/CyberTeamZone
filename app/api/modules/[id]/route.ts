import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// DELETE - Excluir módulo (para admins e instrutores)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Universal modules DELETE endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      console.log('❌ Not authorized role')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const moduleId = params.id
    console.log('📚 Module ID:', moduleId)

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Se for instrutor, verificar se o módulo pertence a um curso dele
    if (userRole === 'INSTRUCTOR') {
      // Primeiro, buscar o módulo
      const { data: module, error: moduleErr } = await supabaseAdmin
        .from('Module')
        .select('id, courseId')
        .eq('id', moduleId)
        .single()

      if (moduleErr || !module) {
        console.log('❌ Module not found:', moduleErr?.message)
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }

      // Depois, verificar se o curso pertence ao instrutor
      const { data: course, error: courseErr } = await supabaseAdmin
        .from('Course')
        .select('id, instructorId')
        .eq('id', module.courseId)
        .single()

      if (courseErr || !course || course.instructorId !== session.user.id) {
        console.log('❌ Course not found or access denied for instructor:', courseErr?.message)
        return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 })
      }
    }

    console.log('🔗 Deleting module from Supabase...')
    
    // Excluir módulo (cascade vai excluir as aulas também)
    const { error: deleteErr } = await supabaseAdmin
      .from('Module')
      .delete()
      .eq('id', moduleId)

    console.log('📊 Module deletion result:', { error: deleteErr?.message })

    if (deleteErr) {
      console.error('❌ Error deleting module:', deleteErr)
      return NextResponse.json({ 
        error: 'Failed to delete module',
        debug: { supabaseError: deleteErr.message }
      }, { status: 500 })
    }

    console.log('✅ Module deleted successfully:', moduleId)
    return NextResponse.json({
      success: true,
      debug: {
        moduleId,
        userRole
      }
    })
  } catch (error) {
    console.error('❌ Error in universal modules DELETE:', error)
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
