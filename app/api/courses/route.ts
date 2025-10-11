import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar todos os cursos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin ou instrutor
    if (!['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: courses, error } = await supabaseAdmin
      .from('Course')
      .select(`
        id,
        title,
        description,
        shortDescription,
        price,
        coverImage,
        approvalStatus,
        instructorId,
        createdAt,
        updatedAt,
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

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    // Ordenar módulos e aulas
    const orderedCourses = courses?.map(course => ({
      ...course,
      modules: (course.modules || []).map((module: any) => ({
        ...module,
        lessons: (module.lessons || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    })) || []

    return NextResponse.json({
      success: true,
      courses: orderedCourses
    })

  } catch (error) {
    console.error('Error in GET /api/courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Criar novo curso
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin ou instrutor
    if (!['ADMIN', 'INSTRUCTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, shortDescription, price, coverImage } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const courseData = {
      title,
      description,
      shortDescription: shortDescription || description.substring(0, 200),
      price: price || 0,
      coverImage: coverImage || null,
      instructorId: session.user.role === 'INSTRUCTOR' ? session.user.id : body.instructorId || session.user.id,
      approvalStatus: session.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING'
    }

    const { data: course, error } = await supabaseAdmin
      .from('Course')
      .insert([courseData])
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      course
    })

  } catch (error) {
    console.error('Error in POST /api/courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}