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
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Admin course content endpoint called for course:', params.id)

    const { data: course, error } = await supabaseAdmin
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
        ),
        modules:Module(
          id,
          title,
          description,
          order,
          lessons:Lesson(
            id,
            title,
            type,
            order,
            videoUrl,
            attachment,
            content,
            duration,
            isPublished,
            createdAt
          )
        )
      `)
      .eq('id', params.id)
      .single()

    console.log('📖 Course data:', course)
    console.log('❌ Course error:', error)

    if (error || !course) {
      return NextResponse.json({ 
        error: 'Course not found',
        debug: {
          courseId: params.id,
          courseError: error?.message,
          courseExists: !!course
        }
      }, { status: 404 })
    }

    // Filtrar apenas aulas publicadas para visualização de membros
    const modulesWithPublishedLessons = (course.modules || []).map((m: any) => ({
      ...m,
      lessons: (m.lessons || []).filter((lesson: any) => lesson.isPublished)
    })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    const ordered = {
      ...course,
      modules: modulesWithPublishedLessons
    }

    console.log('✅ Returning course data with published lessons:', {
      courseId: params.id,
      modulesCount: modulesWithPublishedLessons.length,
      totalLessons: modulesWithPublishedLessons.reduce((sum: any, m: any) => sum + (m.lessons?.length || 0), 0)
    })

    return NextResponse.json({ success: true, course: ordered })
  } catch (e) {
    console.error('Error fetching course content:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
// Removed legacy Prisma implementation
