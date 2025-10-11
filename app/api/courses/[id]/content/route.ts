import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courseId = params.id

    // Buscar dados do curso
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select(`
        id,
        title,
        description,
        instructor:User(
          id,
          name,
          bio,
          avatar
        )
      `)
      .eq('id', courseId)
      .eq('approvalStatus', 'APPROVED')
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Buscar módulos do curso
    const { data: modules, error: modulesErr } = await supabaseAdmin
      .from('Module')
      .select(`
        id,
        title,
        order,
        lessons:Lesson(
          id,
          title,
          content,
          videoUrl,
          duration,
          order,
          type,
          isPublished,
          createdAt
        )
      `)
      .eq('courseId', courseId)
      .eq('isPublished', true)
      .order('order', { ascending: true })

    if (modulesErr) {
      console.error('Error fetching modules:', modulesErr)
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
    }

    // Filtrar apenas aulas publicadas
    const modulesWithPublishedLessons = modules?.map(module => ({
      ...module,
      lessons: module.lessons?.filter(lesson => lesson.isPublished) || []
    })) || []

    // Verificar se o usuário está matriculado no curso (exceto para admins)
    if (session.user.role !== 'ADMIN') {
      const { data: enrollment, error: enrollmentErr } = await supabaseAdmin
        .from('UserCourseEnrollment')
        .select('id')
        .eq('userId', session.user.id)
        .eq('courseId', courseId)
        .single()

      if (enrollmentErr && enrollmentErr.code !== 'PGRST116') {
        console.error('Error checking enrollment:', enrollmentErr)
        return NextResponse.json({ error: 'Failed to check enrollment' }, { status: 500 })
      }

      if (!enrollment) {
        return NextResponse.json({ error: 'User not enrolled in this course' }, { status: 403 })
      }
    }

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        modules: modulesWithPublishedLessons
      }
    })

  } catch (error) {
    console.error('Error in GET /api/courses/[id]/content:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}