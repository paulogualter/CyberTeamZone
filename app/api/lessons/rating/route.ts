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

    const { lessonId, rating } = await req.json()

    if (!lessonId || !rating) {
      return NextResponse.json({ error: 'Lesson ID and rating are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Verificar se a aula existe
    const { data: lesson, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select('id, moduleId')
      .eq('id', lessonId)
      .eq('isPublished', true)
      .single()

    if (lessonErr || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Buscar dados do módulo separadamente
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', lesson.moduleId)
      .single()

    if (moduleErr || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Verificar se o usuário está matriculado no curso
    const { data: enrollment, error: enrollmentErr } = await supabaseAdmin
      .from('UserCourseEnrollment')
      .select('id')
      .eq('userId', session.user.id)
      .eq('courseId', module.courseId)
      .single()

    if (enrollmentErr && enrollmentErr.code !== 'PGRST116') {
      return NextResponse.json({ error: 'User not enrolled in this course' }, { status: 403 })
    }

    // Verificar se já existe uma avaliação
    const { data: existingRating, error: ratingErr } = await supabaseAdmin
      .from('LessonRating')
      .select('id')
      .eq('userId', session.user.id)
      .eq('lessonId', lessonId)
      .single()

    if (ratingErr && ratingErr.code !== 'PGRST116') {
      console.error('Error checking rating:', ratingErr)
      return NextResponse.json({ error: 'Failed to check rating' }, { status: 500 })
    }

    if (existingRating) {
      // Atualizar avaliação existente
      const { error: updateErr } = await supabaseAdmin
        .from('LessonRating')
        .update({
          rating,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingRating.id)

      if (updateErr) {
        console.error('Error updating rating:', updateErr)
        return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 })
      }
    } else {
      // Criar nova avaliação
      const { error: insertErr } = await supabaseAdmin
        .from('LessonRating')
        .insert({
          userId: session.user.id,
          lessonId,
          rating,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

      if (insertErr) {
        console.error('Error creating rating:', insertErr)
        return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Rating saved successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/lessons/rating:', error)
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
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Buscar avaliação do usuário para a aula
    const { data: rating, error: ratingErr } = await supabaseAdmin
      .from('LessonRating')
      .select('rating')
      .eq('userId', session.user.id)
      .eq('lessonId', lessonId)
      .single()

    if (ratingErr && ratingErr.code !== 'PGRST116') {
      console.error('Error fetching rating:', ratingErr)
      return NextResponse.json({ error: 'Failed to fetch rating' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      rating: rating?.rating || 0
    })

  } catch (error) {
    console.error('Error in GET /api/lessons/rating:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}