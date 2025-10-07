import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Criar nova aula
export async function POST(req: NextRequest) {
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

    const { title, content, type, duration, order, videoUrl, attachment, moduleId } = await req.json()

    // Validação básica
    if (!title || !content || !type || !moduleId) {
      return NextResponse.json(
        { error: 'Title, content, type and moduleId are required' },
        { status: 400 }
      )
    }

    // Verificar se o módulo pertence ao instrutor
    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        course: {
          instructor: {
            email: session.user.email as string
          }
        }
      }
    })

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found or access denied' },
        { status: 404 }
      )
    }

    // Criar aula
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        type,
        duration: duration || 0,
        order: order || 0,
        videoUrl: videoUrl || null,
        attachment: attachment || null,
        moduleId,
        isPublished: false
      }
    })

    return NextResponse.json({
      success: true,
      lesson
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
