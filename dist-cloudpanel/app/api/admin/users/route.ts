import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET - Listar todos os usuários
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
    const role = searchParams.get('role')

    const skip = (page - 1) * limit

    // Build where clause - apenas admins e instrutores
    const where: any = {
      role: {
        in: ['ADMIN', 'INSTRUCTOR']
      }
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

    if (role && role !== 'all' && ['ADMIN', 'INSTRUCTOR'].includes(role)) {
      where.role = role
    }

    // Get total count
    const totalCount = await prisma.user.count({ where })

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        escudos: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        _count: {
          select: {
            enrollments: true,
            payments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar usuário (role, status, etc.)
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

    const { userId, role, isActive, escudos } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(escudos !== undefined && { escudos: parseInt(escudos) })
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

    // Se o role foi alterado para INSTRUCTOR, sincronizar com a tabela Instructor
    if (role === 'INSTRUCTOR') {
      try {
        // Verificar se já existe um instrutor com este email
        const existingInstructor = await prisma.instructor.findUnique({
          where: { email: user.email }
        })

        if (!existingInstructor) {
          // Criar novo instrutor
          await prisma.instructor.create({
            data: {
              name: user.name || 'Instrutor',
              email: user.email,
              bio: 'Instrutor do CyberTeam',
              avatar: user.image || null,
              expertise: JSON.stringify(['Cibersegurança']),
              socialLinks: JSON.stringify({}),
              isActive: true
            }
          })
          console.log(`✅ Instrutor criado para ${user.email}`)
        } else {
          // Atualizar instrutor existente
          await prisma.instructor.update({
            where: { email: user.email },
            data: {
              name: user.name || existingInstructor.name,
              isActive: isActive !== undefined ? isActive : existingInstructor.isActive
            }
          })
          console.log(`✅ Instrutor atualizado para ${user.email}`)
        }
      } catch (instructorError) {
        console.error('Erro ao sincronizar instrutor:', instructorError)
        // Não falhar a operação principal, apenas logar o erro
      }
    }

    // Se o role foi alterado para STUDENT, desativar instrutor se existir
    if (role === 'STUDENT') {
      try {
        const existingInstructor = await prisma.instructor.findUnique({
          where: { email: user.email }
        })

        if (existingInstructor) {
          await prisma.instructor.update({
            where: { email: user.email },
            data: { isActive: false }
          })
          console.log(`✅ Instrutor desativado para ${user.email}`)
        }
      } catch (instructorError) {
        console.error('Erro ao desativar instrutor:', instructorError)
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
