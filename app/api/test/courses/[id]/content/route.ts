import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    console.log('🔍 Testing course fetch for:', courseId)

    // Buscar dados do curso sem autenticação
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select(`
        id,
        title,
        description,
        approvalStatus,
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
          courseId,
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
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
    }

    // Filtrar apenas aulas publicadas
    const modulesWithPublishedLessons = modules?.map(module => ({
      ...module,
      lessons: module.lessons?.filter(lesson => lesson.isPublished) || []
    })) || []

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        modules: modulesWithPublishedLessons
      }
    })

  } catch (error) {
    console.error('Error in GET /api/test/courses/[id]/content:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}