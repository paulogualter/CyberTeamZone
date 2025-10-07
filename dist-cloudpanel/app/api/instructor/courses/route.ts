import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar cursos do instrutor
export async function GET(req: NextRequest) {
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

    const courses = await prisma.course.findMany({
      where: {
        instructor: {
          email: session.user.email || ''
        }
      },
      include: {
        instructor: true,
        category: true,
        modules: {
          include: {
            lessons: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformar dados para incluir enrolledCount
    const coursesWithCount = courses.map((course: any) => ({
      ...course,
      enrolledCount: course._count.enrollments
    }))

    return NextResponse.json({
      success: true,
      courses: coursesWithCount
    })
  } catch (error) {
    console.error('Error fetching instructor courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar novo curso
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 POST /api/instructor/courses - Iniciando...')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session:', session ? 'Found' : 'Not found')
    console.log('👤 User ID:', session?.user?.id)
    console.log('📧 User Email:', session?.user?.email)
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é instrutor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    console.log('👤 User found:', user)
    console.log('🎭 User role:', user?.role)

    if (user?.role !== 'INSTRUCTOR') {
      console.log('❌ Forbidden: User is not an instructor')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, description, shortDescription, price, escudosPrice, duration, categoryId, coverImage, difficulty, status, courseType, startDate, isPublished } = await req.json()

    // Validação básica
    if (!title || !categoryId) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    // Calcular escudos automaticamente: floor(Preço_em_reais / 0,50)
    const calculatedEscudos = Math.floor(parseFloat(price || 0) / 0.50)
    const finalEscudosPrice = escudosPrice ? parseInt(escudosPrice) : calculatedEscudos

    // Debug: validar dados recebidos
    console.log('Received data:', {
      title: typeof title,
      categoryId: typeof categoryId,
      difficulty,
      status,
      isPublished: typeof isPublished
    })

    console.log('Creating course with data:', {
      title,
      description,
      shortDescription,
      price,
      escudosPrice,
      duration,
      categoryId,
      coverImage,
      difficulty,
      status,
      isPublished
    })


    // Verificar se a categoria existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Buscar ou criar instrutor pelo email
    let instructor = await prisma.instructor.findUnique({
      where: { email: session.user.email! }
    })

    if (!instructor) {
      // Se não existe instrutor, criar automaticamente
      console.log('Instrutor não encontrado, criando automaticamente...')
      
      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, image: true }
      })

      instructor = await prisma.instructor.create({
        data: {
          name: user?.name || 'Instrutor',
          email: session.user.email!,
          bio: 'Instrutor do CyberTeam',
          avatar: user?.image || null,
          expertise: JSON.stringify(['Cibersegurança']),
          socialLinks: JSON.stringify({}),
          isActive: true
        }
      })
      
      console.log('✅ Instrutor criado automaticamente:', instructor)
    }

    // Teste simples primeiro
    console.log('Instructor found:', instructor)
    console.log('Category ID:', categoryId)

    // Verificar se a categoria existe
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    })
    console.log('Category exists:', categoryExists)

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Criar curso com dados mínimos - teste step by step
    try {
      console.log('Tentando criar curso...')
      
      const course = await prisma.course.create({
        data: {
          title: title.trim(),
          description: (description || '').trim(),
          shortDescription: (shortDescription || '').trim(),
          price: parseFloat(price) || 0,
          escudosPrice: finalEscudosPrice,
          duration: parseInt(duration) || 0,
          coverImage: (coverImage || '').trim(),
          status: (status || 'ACTIVE') as any,
          difficulty: (difficulty || 'BEGINNER') as any,
          courseType: (courseType || 'RECORDED') as any,
          startDate: courseType === 'ONLINE' || courseType === 'HYBRID' ? new Date(startDate) : null,
          isPublished: false, // Sempre false até ser aprovado
          approvalStatus: 'PENDING', // Sempre PENDING para instrutores
          submittedForApprovalAt: new Date(),
          instructorId: instructor.id,
          categoryId: categoryId.trim()
        },
        include: {
          instructor: true,
          category: true
        }
      })
      
      console.log('Curso criado com sucesso:', course)
      
      return NextResponse.json({
        success: true,
        course
      }, { status: 201 })
      
    } catch (createError) {
      console.error('Erro ao criar curso:', createError)
      console.error('Detalhes do erro:', {
        message: (createError as Error).message,
        stack: (createError as Error).stack,
        name: (createError as Error).name
      })
      
      return NextResponse.json(
        { error: 'Erro ao criar curso', details: (createError as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating course:', error)
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    })
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
