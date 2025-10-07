import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Criar novo módulo
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

    const { title, description, order, courseId } = await req.json()

    // Validação básica
    if (!title || !courseId) {
      return NextResponse.json(
        { error: 'Title and courseId are required' },
        { status: 400 }
      )
    }

    // Verificar se o curso pertence ao instrutor
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructor: {
          email: session.user.email as string
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      )
    }

    // Criar módulo
    const module = await prisma.module.create({
      data: {
        title,
        description: description || '',
        order: order || 0,
        courseId,
        isPublished: false
      }
    })

    return NextResponse.json({
      success: true,
      module
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
