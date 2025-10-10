import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar os cursos inscritos do usuário
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        course: {
          include: {
            instructor: true,
            category: true,
            modules: {
              include: {
                lessons: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    // Transformar os dados para o formato esperado
    const enrolledCourses = await Promise.all(enrollments.map(async (enrollment) => {
      // Calcular progresso real baseado nas aulas concluídas
      const totalLessons = enrollment.course.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0)
      
      // Buscar progresso do usuário para este curso
      const userProgress = await prisma.userProgress.findMany({
        where: {
          userId: session.user.id,
          lesson: {
            module: {
              courseId: enrollment.course.id
            }
          }
        }
      })
      
      const completedLessons = userProgress.filter((progress: any) => progress.completed).length
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      
      return {
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        shortDescription: enrollment.course.shortDescription,
        instructor: enrollment.course.instructor,
        difficulty: enrollment.course.difficulty,
        duration: enrollment.course.duration,
        price: enrollment.course.price,
        escudosPrice: enrollment.course.escudosPrice,
        coverImage: enrollment.course.coverImage ? enrollment.course.coverImage : null,
        videoUrl: enrollment.course.videoUrl,
        isPublished: enrollment.course.isPublished,
        isFree: enrollment.course.isFree,
        categoryId: enrollment.course.categoryId,
        category: enrollment.course.category,
        courseType: enrollment.course.courseType,
        rating: 4.5, // Mock rating for now
        enrolledCount: 0, // Will be calculated separately if needed
        createdAt: enrollment.course.createdAt,
        updatedAt: enrollment.course.updatedAt,
        progress: progressPercentage,
        completedLessons,
        totalLessons,
        completed: enrollment.completedAt ? true : false,
        enrolledAt: enrollment.enrolledAt
      }
    }))

    return NextResponse.json({
      success: true,
      courses: enrolledCourses
    })
  } catch (error) {
    console.error('Error fetching user enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
