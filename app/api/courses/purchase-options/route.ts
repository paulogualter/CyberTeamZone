import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
        category: true,
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is an instructor - they cannot purchase courses
    // Admins can access everything without restrictions
    if (user.role === 'INSTRUCTOR') {
      return NextResponse.json({ 
        error: 'Instructors cannot purchase courses',
        isInstructor: true 
      }, { status: 403 })
    }

    // Admins have unrestricted access to all courses
    if (user.role === 'ADMIN') {
      return NextResponse.json({
        course: {
          id: course.id,
          title: course.title,
          price: course.price,
          escudosPrice: course.escudosPrice,
          description: course.description,
          shortDescription: course.shortDescription,
          duration: course.duration,
          instructor: course.instructor,
          category: course.category,
        },
        user: {
          escudos: user.escudos,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionStatus: user.subscriptionStatus,
        },
        purchaseOptions: {
          canPayWithEscudos: true, // Admin can always purchase with escudos
          escudosNeeded: 0,
          canPayWithMoney: true,
          adminAccess: true // Flag to indicate admin access
        },
        planUpgrades: [] // No plan upgrades needed for admin
      })
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json({ 
        error: 'User already enrolled in this course',
        alreadyEnrolled: true 
      }, { status: 400 })
    }

    // Check escudos availability
    const hasEnoughEscudos = user.escudos >= course.escudosPrice
    const escudosNeeded = course.escudosPrice - user.escudos

    // Get subscription plan details
    const planDetails = getPlanDetails(user.subscriptionPlan)

    // Calculate escudos that would be gained with each plan
    const escudosGained = {
      basic: 50,
      gold: 80,
      diamond: 130,
    }

    const options = {
      course: {
        id: course.id,
        title: course.title,
        price: course.price,
        escudosPrice: course.escudosPrice,
        description: course.description,
        shortDescription: course.shortDescription,
        duration: course.duration,
        instructor: course.instructor,
        category: course.category,
      },
      user: {
        escudos: user.escudos,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
      },
      purchaseOptions: {
        canPayWithEscudos: hasEnoughEscudos,
        escudosNeeded: escudosNeeded > 0 ? escudosNeeded : 0,
        canPayWithMoney: true,
        currentPlan: planDetails,
        upgradeOptions: [
          {
            plan: 'basic',
            name: 'Plano Básico',
            price: 49.90,
            escudos: 50,
            escudosAfterUpgrade: user.escudos + 50,
            canAffordCourse: true, // Sempre permitir upgrade
          },
          {
            plan: 'gold',
            name: 'Plano Gold',
            price: 79.90,
            escudos: 80,
            escudosAfterUpgrade: user.escudos + 80,
            canAffordCourse: true, // Sempre permitir upgrade
          },
          {
            plan: 'diamond',
            name: 'Plano Diamond',
            price: 129.90,
            escudos: 130,
            escudosAfterUpgrade: user.escudos + 130,
            canAffordCourse: true, // Sempre permitir upgrade
          },
        ],
      },
    }

    return NextResponse.json({
      success: true,
      ...options,
    })

  } catch (error) {
    console.error('Error getting purchase options:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getPlanDetails(plan: string | null | undefined) {
  switch (plan) {
    case 'BASIC':
      return {
        name: 'Plano Básico',
        price: 49.90,
        escudos: 50,
        features: ['Acesso a cursos básicos', '50 escudos mensais', 'Suporte por email'],
      }
    case 'GOLD':
      return {
        name: 'Plano Gold',
        price: 79.90,
        escudos: 80,
        features: ['Acesso a todos os cursos', '80 escudos mensais', 'Suporte prioritário', 'Certificados'],
      }
    case 'DIAMOND':
      return {
        name: 'Plano Diamond',
        price: 129.90,
        escudos: 130,
        features: ['Acesso completo', '130 escudos mensais', 'Suporte 24/7', 'Mentoria personalizada'],
      }
    default:
      return {
        name: 'Sem Plano',
        price: 0,
        escudos: 0,
        features: ['Acesso limitado'],
      }
  }
}
