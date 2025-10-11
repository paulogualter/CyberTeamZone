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
      // Primeiro, buscar a aula e seu módulo
      const { data: lesson, error: lessonErr } = await supabaseAdmin
        .from('Lesson')
        .select('id, moduleId')
        .eq('id', lessonId)
        .single()

      if (lessonErr || !lesson) {
        console.log('❌ Lesson not found:', lessonErr?.message)
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      }

      // Depois, buscar o módulo e verificar o curso
      const { data: module, error: moduleErr } = await supabaseAdmin
        .from('Module')
        .select('id, courseId')
        .eq('id', lesson.moduleId)
        .single()

      if (moduleErr || !module) {
        console.log('❌ Module not found:', moduleErr?.message)
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }

      // Finalmente, verificar se o curso pertence ao instrutor
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
