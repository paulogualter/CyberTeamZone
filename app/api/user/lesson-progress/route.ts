import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonId, completed } = await req.json()

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Verificar se a aula existe e se o usuário tem acesso
    const { data: lesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select(`
        id,
        moduleId,
        module:Module(
          courseId,
          course:Course(
            id,
            title
          )
        )
      `)
      .eq('id', lessonId)
      .eq('isPublished', true)
      .single()

    if (lessonErr || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Verificar se o usuário está matriculado no curso
    const { data: enrollment, error: enrollmentErr } = await supabaseAdmin
      .from('UserCourseEnrollment')
      .select('id')
      .eq('userId', session.user.id)
      .eq('courseId', lesson.module.courseId)
      .single()

    if (enrollmentErr && enrollmentErr.code !== 'PGRST116') {
      return NextResponse.json({ error: 'User not enrolled in this course' }, { status: 403 })
    }

    // Inserir ou atualizar progresso da aula
    const { data: existingProgress, error: progressErr } = await supabaseAdmin
      .from('UserLessonProgress')
      .select('id')
      .eq('userId', session.user.id)
      .eq('lessonId', lessonId)
      .single()

    if (progressErr && progressErr.code !== 'PGRST116') {
      console.error('Error checking progress:', progressErr)
      return NextResponse.json({ error: 'Failed to check progress' }, { status: 500 })
    }

    if (existingProgress) {
      // Atualizar progresso existente
      const { error: updateErr } = await supabaseAdmin
        .from('UserLessonProgress')
        .update({
          completed,
          completedAt: completed ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingProgress.id)

      if (updateErr) {
        console.error('Error updating progress:', updateErr)
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
      }
    } else {
      // Criar novo progresso
      const { error: insertErr } = await supabaseAdmin
        .from('UserLessonProgress')
        .insert({
          userId: session.user.id,
          lessonId,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

      if (insertErr) {
        console.error('Error creating progress:', insertErr)
        return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: completed ? 'Lesson marked as completed' : 'Lesson marked as incomplete'
    })

  } catch (error) {
    console.error('Error in POST /api/user/lesson-progress:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Buscar progresso do usuário no curso
    const { data: progress, error: progressErr } = await supabaseAdmin
      .from('UserLessonProgress')
      .select(`
        lessonId,
        completed,
        completedAt,
        lesson:Lesson(
          id,
          title,
          moduleId,
          module:Module(
            courseId
          )
        )
      `)
      .eq('userId', session.user.id)
      .eq('lesson.module.courseId', courseId)

    if (progressErr) {
      console.error('Error fetching progress:', progressErr)
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      progress: progress || []
    })

  } catch (error) {
    console.error('Error in GET /api/user/lesson-progress:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}
