import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// DELETE - Excluir aula (para admins e instrutores)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Universal lessons DELETE endpoint called')
    
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

    const lessonId = params.id
    console.log('📚 Lesson ID:', lessonId)

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Se for instrutor, verificar se a aula pertence a um módulo de um curso dele
    if (userRole === 'INSTRUCTOR') {
      const { data: lesson, error: lessonErr } = await supabaseAdmin
        .from('Lesson')
        .select(`
          id,
          module:Module(id, course:Course(id, instructorId))
        `)
        .eq('id', lessonId)
        .single()

      if (lessonErr || !lesson || lesson.module.course.instructorId !== session.user.id) {
        console.log('❌ Lesson not found or access denied for instructor:', lessonErr?.message)
        return NextResponse.json({ error: 'Lesson not found or access denied' }, { status: 404 })
      }
    }

    console.log('🔗 Deleting lesson from Supabase...')
    
    // Excluir aula
    const { error: deleteErr } = await supabaseAdmin
      .from('Lesson')
      .delete()
      .eq('id', lessonId)

    console.log('📊 Lesson deletion result:', { error: deleteErr?.message })

    if (deleteErr) {
      console.error('❌ Error deleting lesson:', deleteErr)
      return NextResponse.json({ 
        error: 'Failed to delete lesson',
        debug: { supabaseError: deleteErr.message }
      }, { status: 500 })
    }

    console.log('✅ Lesson deleted successfully:', lessonId)
    return NextResponse.json({
      success: true,
      debug: {
        lessonId,
        userRole
      }
    })
  } catch (error) {
    console.error('❌ Error in universal lessons DELETE:', error)
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
