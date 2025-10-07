import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Atualizar aula
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é instrutor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, content, type, duration, order, videoUrl, attachment } = await req.json()

    // Verificar se a aula pertence ao instrutor
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: params.id,
        module: {
          course: {
            instructor: {
              email: session.user.email as string
            }
          }
        }
      }
    })

    if (!existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Atualizar aula
    const lesson = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(type && { type }),
        ...(duration !== undefined && { duration }),
        ...(order !== undefined && { order }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(attachment !== undefined && { attachment })
      }
    })

    return NextResponse.json({
      success: true,
      lesson
    })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir aula
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é instrutor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verificar se a aula pertence ao instrutor
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: params.id,
        module: {
          course: {
            instructor: {
              email: session.user.email as string
            }
          }
        }
      }
    })

    if (!existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Excluir aula
    await prisma.lesson.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
