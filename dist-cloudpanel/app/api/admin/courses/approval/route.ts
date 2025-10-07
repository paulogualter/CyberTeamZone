import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar cursos pendentes de aprovação
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const courses = await prisma.course.findMany({
      where: {
        approvalStatus: status as any
      },
      include: {
        instructor: true,
        category: true
      },
      orderBy: {
        submittedForApprovalAt: 'desc'
      },
      skip,
      take: limit
    })

    const total = await prisma.course.count({
      where: {
        approvalStatus: status as any
      }
    })

    return NextResponse.json({
      success: true,
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching courses for approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Aprovar ou rejeitar curso
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { courseId, action, rejectionReason } = await req.json()

    if (!courseId || !action) {
      return NextResponse.json(
        { error: 'Course ID and action are required' },
        { status: 400 }
      )
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      )
    }

    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.approvalStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Course is not pending approval' },
        { status: 400 }
      )
    }

    // Atualizar curso
    const updateData: any = {
      approvedBy: session.user.id
    }

    if (action === 'APPROVE') {
      updateData.approvalStatus = 'APPROVED'
      updateData.approvedAt = new Date()
      updateData.isPublished = true // Publicar automaticamente quando aprovado
      updateData.rejectionReason = null
    } else {
      updateData.approvalStatus = 'REJECTED'
      updateData.rejectionReason = rejectionReason || 'Rejeitado pelo administrador'
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        instructor: true,
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      course: updatedCourse,
      message: action === 'APPROVE' 
        ? 'Curso aprovado com sucesso!' 
        : 'Curso rejeitado com sucesso!'
    })
  } catch (error) {
    console.error('Error updating course approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
