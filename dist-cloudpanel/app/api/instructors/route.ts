import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Função para gerar senha aleatória de 12 caracteres
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export async function GET() {
  try {
    console.log('Fetching instructors...')
    const instructors = await prisma.instructor.findMany({
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            approvalStatus: true,
            price: true,
            escudosPrice: true,
            enrollments: {
              select: {
                id: true
              }
            },
            payments: {
              select: {
                id: true,
                amount: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Calcular estatísticas para cada instrutor
    const instructorsWithStats = instructors.map(instructor => {
      const totalCourses = instructor.courses.length
      const publishedCourses = instructor.courses.filter(course => 
        course.isPublished && course.approvalStatus === 'APPROVED'
      ).length
      const pendingCourses = instructor.courses.filter(course => 
        course.approvalStatus === 'PENDING'
      ).length
      const rejectedCourses = instructor.courses.filter(course => 
        course.approvalStatus === 'REJECTED'
      ).length
      
      const totalEnrollments = instructor.courses.reduce((sum, course) => 
        sum + course.enrollments.length, 0
      )
      
      const totalRevenue = instructor.courses.reduce((sum, course) => {
        const courseRevenue = course.payments
          .filter(payment => payment.status === 'COMPLETED')
          .reduce((courseSum, payment) => courseSum + payment.amount, 0)
        return sum + courseRevenue
      }, 0)

      return {
        ...instructor,
        stats: {
          totalCourses,
          publishedCourses,
          pendingCourses,
          rejectedCourses,
          totalEnrollments,
          totalRevenue
        }
      }
    })

    console.log('Instructors found:', instructorsWithStats.length)
    return NextResponse.json({
      success: true,
      instructors: instructorsWithStats
    })
  } catch (error) {
    console.error('Error fetching instructors:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, bio, avatar, expertise, socialLinks } = await req.json()

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if instructor already exists
    const existingInstructor = await prisma.instructor.findUnique({
      where: { email }
    })

    if (existingInstructor) {
      return NextResponse.json(
        { error: 'Instructor with this email already exists' },
        { status: 409 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Generate random password
    const randomPassword = generateRandomPassword(12)
    const hashedPassword = await bcrypt.hash(randomPassword, 12)

    // Create instructor and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create instructor
      const instructor = await tx.instructor.create({
        data: {
          name,
          email,
          bio,
          avatar,
          expertise: expertise !== undefined ? expertise : undefined,
          socialLinks: socialLinks !== undefined ? socialLinks : undefined
        }
      })

      // Create user account for instructor
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'INSTRUCTOR',
          isActive: true,
          escudos: 0,
          subscriptionStatus: 'ACTIVE', // Instrutores têm acesso total
          subscriptionPlan: null // Instrutores não precisam de plano
        }
      })

      return { instructor, user, password: randomPassword }
    })

    return NextResponse.json({
      success: true,
      instructor: result.instructor,
      user: result.user,
      generatedPassword: result.password,
      message: 'Instrutor criado com sucesso! Senha gerada automaticamente.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating instructor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
