import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar todos os cursos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const instructor = searchParams.get('instructor')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { instructor: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (category && category !== 'all') {
      where.categoryId = category
    }

    if (instructor && instructor !== 'all') {
      where.instructorId = instructor
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // Get total count for pagination
    const totalCount = await prisma.course.count({ where })

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: true,
        instructor: true,
        modules: {
          include: {
            lessons: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Transformar os dados para incluir contagem de aulas
    const coursesWithStats = courses.map(course => ({
      ...course,
      lessonsCount: course.modules.reduce((total, module) => total + module.lessons.length, 0)
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      courses: coursesWithStats,
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
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar novo curso
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      shortDescription,
      description,
      price,
      escudosPrice,
      difficulty,
      duration,
      categoryId,
      instructorId,
      coverImage,
      isPublished,
      status = 'ACTIVE'
    } = body

    // Validar dados obrigatórios
    if (!title || !shortDescription || !price || !difficulty || !duration || !categoryId || !instructorId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Calcular escudos automaticamente: floor(Preço_em_reais / 0,50)
    const calculatedEscudos = Math.floor(parseFloat(price) / 0.50)
    const finalEscudosPrice = escudosPrice ? parseInt(escudosPrice) : calculatedEscudos

    // Verificar se a categoria existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 400 }
      )
    }

    // Verificar se o instrutor existe
    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId }
    })

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instrutor não encontrado' },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: {
        title,
        shortDescription: shortDescription ? shortDescription.substring(0, 60) : null,
        description: description || '',
        price: parseFloat(price),
        escudosPrice: finalEscudosPrice,
        difficulty,
        duration: parseInt(duration),
        categoryId,
        instructorId,
        coverImage: coverImage || '',
        isPublished: isPublished || false,
        status: status || 'ACTIVE'
      },
      include: {
        category: true,
        instructor: true
      }
    })

    return NextResponse.json({
      success: true,
      course
    })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
