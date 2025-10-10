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
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Salvar ou atualizar a avaliação
    const existingRating = await prisma.lessonRating.findFirst({
      where: {
        userId: session.user.id,
        lessonId: lessonId
      }
    })

    if (existingRating) {
      // Atualizar avaliação existente
      await prisma.lessonRating.update({
        where: { id: existingRating.id },
        data: { rating }
      })
    } else {
      // Criar nova avaliação
      await prisma.lessonRating.create({
        data: {
          userId: session.user.id,
          lessonId: lessonId,
          rating
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Rating saved successfully'
    })
  } catch (error) {
    console.error('Error saving lesson rating:', error)
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

    // Buscar avaliação do usuário para esta aula
    const rating = await prisma.lessonRating.findFirst({
      where: {
        userId: session.user.id,
        lessonId: lessonId
      }
    })

    return NextResponse.json({
      success: true,
      rating: rating?.rating || 0
    })
  } catch (error) {
    console.error('Error fetching lesson rating:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
