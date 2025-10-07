import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET - Listar todos os alunos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // Build where clause - apenas alunos
    const where: any = {
      role: 'STUDENT'
    }
    
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      ]
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        where.isActive = true
      } else if (status === 'inactive') {
        where.isActive = false
      }
    }

    // Get total count
    const totalCount = await prisma.user.count({ where })

    // Get students with pagination
    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        escudos: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get student metrics
    const totalStudents = await prisma.user.count({
      where: { role: 'STUDENT' }
    })

    const studentsWithActiveSubscription = await prisma.user.count({
      where: { 
        role: 'STUDENT',
        subscriptionStatus: 'ACTIVE'
      }
    })

    const studentsWithoutActiveSubscription = totalStudents - studentsWithActiveSubscription

    return NextResponse.json({
      success: true,
      students,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      metrics: {
        totalStudents,
        studentsWithActiveSubscription,
        studentsWithoutActiveSubscription
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar aluno
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { studentId, isActive, escudos, subscriptionStatus, subscriptionPlan } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    // Verificar se o aluno existe e é realmente um aluno
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'User is not a student' }, { status: 400 })
    }

    // Atualizar aluno
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(escudos !== undefined && { escudos: parseInt(escudos) }),
        ...(subscriptionStatus && { subscriptionStatus }),
        ...(subscriptionPlan && { subscriptionPlan })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        escudos: true,
        subscriptionStatus: true,
        subscriptionPlan: true
      }
    })

    return NextResponse.json({
      success: true,
      student: updatedStudent
    })
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Redefinir senha do aluno
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { studentId, newPassword } = await req.json()

    if (!studentId || !newPassword) {
      return NextResponse.json({ 
        error: 'Student ID and new password are required' 
      }, { status: 400 })
    }

    // Verificar se o aluno existe e é realmente um aluno
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true, email: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'User is not a student' }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Atualizar senha
    await prisma.user.update({
      where: { id: studentId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
