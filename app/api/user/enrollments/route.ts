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
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('Enrollment')
      .select(`
        *,
        course:Course(
          *,
          instructor:Instructor(*),
          category:Category(*),
          modules:Module(
            *,
            lessons:Lesson(*)
          )
        )
      `)
      .eq('userId', session.user.id)
      .eq('isActive', true)
      .order('enrolledAt', { ascending: false })

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
    }

    // Transformar os dados para o formato esperado
    const enrolledCourses = await Promise.all((enrollments || []).map(async (enrollment) => {
      // Calcular progresso real baseado nas aulas concluídas
      const totalLessons = enrollment.course.modules?.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0) || 0
      
      // Buscar progresso do usuário para este curso
      const { data: userProgress, error: progressError } = await supabaseAdmin
        .from('UserProgress')
        .select(`
          *,
          lesson:Lesson(
            module:Module(courseId)
          )
        `)
        .eq('userId', session.user.id)
        .eq('lesson.module.courseId', enrollment.course.id)

      const completedLessons = userProgress?.length || 0
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      return {
        ...enrollment.course,
        enrollmentDate: enrollment.enrolledAt,
        progress: {
          completedLessons,
          totalLessons,
          percentage: progressPercentage
        }
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