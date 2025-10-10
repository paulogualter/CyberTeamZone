import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonId, rating } = await req.json()

    if (!lessonId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Lesson ID and rating (1-5) are required' },
        { status: 400 }
      )
    }

    // Verificar se a aula existe
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('Lesson')
      .select('*')
      .eq('id', lessonId)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Verificar se o usuário já avaliou esta aula
    const { data: existingRating, error: existingError } = await supabaseAdmin
      .from('LessonRating')
      .select('*')
      .eq('userId', session.user.id)
      .eq('lessonId', lessonId)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing rating:', existingError)
      return NextResponse.json(
        { error: 'Failed to check existing rating' },
        { status: 500 }
      )
    }

    if (existingRating) {
      // Atualizar avaliação existente
      const { data: updatedRating, error: updateError } = await supabaseAdmin
        .from('LessonRating')
        .update({
          rating,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select('*')
        .single()

      if (updateError) {
        console.error('Error updating rating:', updateError)
        return NextResponse.json(
          { error: 'Failed to update rating' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Rating updated successfully',
        rating: updatedRating
      })
    } else {
      // Criar nova avaliação
      const ratingId = `rating_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      
      const { data: newRating, error: createError } = await supabaseAdmin
        .from('LessonRating')
        .insert({
          id: ratingId,
          userId: session.user.id,
          lessonId,
          rating,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select('*')
        .single()

      if (createError) {
        console.error('Error creating rating:', createError)
        return NextResponse.json(
          { error: 'Failed to create rating' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Rating created successfully',
        rating: newRating
      })
    }

  } catch (error) {
    console.error('Error rating lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    // Buscar avaliações da aula
    const { data: ratings, error: ratingsError } = await supabaseAdmin
      .from('LessonRating')
      .select(`
        *,
        user:User(name, email)
      `)
      .eq('lessonId', lessonId)

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError)
      return NextResponse.json(
        { error: 'Failed to fetch ratings' },
        { status: 500 }
      )
    }

    // Calcular média das avaliações
    const averageRating = ratings && ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0

    return NextResponse.json({
      success: true,
      ratings: ratings || [],
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings?.length || 0
    })

  } catch (error) {
    console.error('Error fetching lesson ratings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}