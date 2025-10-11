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
    
    // Permitir acesso para admins e instrutores
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courseId = params.id
    console.log('🔍 Admin member view endpoint called for course:', courseId)

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
      .single()

    console.log('📖 Course data:', course)
    console.log('❌ Course error:', courseErr)

    if (courseErr || !course) {
      return NextResponse.json({ 
        error: 'Course not found',
        debug: {
          courseId: courseId,
          courseError: courseErr?.message,
          courseExists: !!course
        }
      }, { status: 404 })
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
      .order('order', { ascending: true })

    console.log('📚 Modules data:', modules)
    console.log('❌ Modules error:', modulesErr)

    if (modulesErr) {
      console.error('Error fetching modules:', modulesErr)
      return NextResponse.json({ 
        error: 'Failed to fetch modules',
        debug: {
          courseId: courseId,
          modulesError: modulesErr.message
        }
      }, { status: 500 })
    }

    // Filtrar apenas aulas publicadas
    const modulesWithPublishedLessons = modules?.map(module => ({
      ...module,
      lessons: module.lessons?.filter(lesson => lesson.isPublished) || []
    })) || []

    console.log('✅ Returning course data with modules:', {
      courseId: courseId,
      modulesCount: modulesWithPublishedLessons.length,
      totalLessons: modulesWithPublishedLessons.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
    })

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        modules: modulesWithPublishedLessons
      }
    })

  } catch (error) {
    console.error('Error in GET /api/admin/courses/[id]/member-view:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}
