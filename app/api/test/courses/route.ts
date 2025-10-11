import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Fetching all courses...')

    // Primeiro, testar conexão básica com Supabase
    const { data: testData, error: testError } = await supabaseAdmin
      .from('Course')
      .select('id, title')
      .limit(1)

    console.log('🧪 Test query result:', { testData, testError })

    if (testError) {
      console.error('❌ Supabase connection error:', testError)
      return NextResponse.json({ 
        error: 'Database connection failed', 
        debug: testError.message 
      }, { status: 500 })
    }

    // Se a conexão básica funcionar, buscar dados completos
    const { data: courses, error: coursesErr } = await supabaseAdmin
      .from('Course')
      .select(`
        id,
        title,
        description,
        approvalStatus,
        instructorId,
        modules:Module(
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
        )
      `)
      .order('createdAt', { ascending: false })

    console.log('📖 Courses data:', courses)
    console.log('❌ Courses error:', coursesErr)

    if (coursesErr) {
      console.error('Error fetching courses:', coursesErr)
      return NextResponse.json({ 
        error: 'Failed to fetch courses', 
        debug: coursesErr.message 
      }, { status: 500 })
    }

    // Ordenar módulos e aulas
    const orderedCourses = courses?.map(course => ({
      ...course,
      modules: (course.modules || []).map((module: any) => ({
        ...module,
        lessons: (module.lessons || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    })) || []

    console.log('✅ Returning courses:', {
      count: orderedCourses.length,
      totalModules: orderedCourses.reduce((sum: any, c: any) => sum + (c.modules?.length || 0), 0),
      totalLessons: orderedCourses.reduce((sum: any, c: any) => 
        sum + c.modules?.reduce((mSum: any, m: any) => mSum + (m.lessons?.length || 0), 0), 0)
    })

    return NextResponse.json({
      success: true,
      courses: orderedCourses
    })

  } catch (error) {
    console.error('❌ Error in GET /api/test/courses:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', debug: errorMessage },
      { status: 500 }
    )
  }
}
