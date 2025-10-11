import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug instructor modules endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session:', {
      exists: !!session,
      userId: session?.user?.id,
      userRole: (session?.user as any)?.role,
      userName: session?.user?.name
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session found',
        debug: 'User not authenticated'
      }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (userRole !== 'INSTRUCTOR') {
      return NextResponse.json({ 
        error: 'User is not an instructor',
        debug: `User role: ${userRole}`
      }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    console.log('📚 Course ID:', courseId)

    if (!courseId) {
      return NextResponse.json({ 
        error: 'Course ID is required',
        debug: 'No courseId provided in query params'
      }, { status: 400 })
    }

    // Verificar se o curso existe
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, title, instructorId')
      .eq('id', courseId)
      .single()

    console.log('📚 Course query result:', {
      course: course,
      error: courseErr?.message,
      courseExists: !!course
    })

    if (courseErr) {
      return NextResponse.json({ 
        error: 'Course not found',
        debug: courseErr.message,
        courseId: courseId
      }, { status: 404 })
    }

    if (!course) {
      return NextResponse.json({ 
        error: 'Course not found',
        debug: 'No course returned from database',
        courseId: courseId
      }, { status: 404 })
    }

    // Verificar se o curso pertence ao instrutor
    if (course.instructorId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Access denied',
        debug: `Course instructorId (${course.instructorId}) does not match session userId (${session.user.id})`,
        courseId: courseId,
        courseTitle: course.title
      }, { status: 403 })
    }

    // Buscar módulos do curso
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select('*')
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    console.log('📚 Modules query result:', {
      modules: modules,
      error: modErr?.message,
      modulesCount: modules?.length || 0
    })

    return NextResponse.json({ 
      success: true, 
      debug: {
        session: {
          userId: session.user.id,
          userRole: userRole,
          userName: session.user.name
        },
        course: {
          id: course.id,
          title: course.title,
          instructorId: course.instructorId
        },
        modules: modules || [],
        modulesCount: modules?.length || 0
      },
      modules: modules || []
    })

  } catch (error) {
    console.error('❌ Error in debug instructor modules:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    )
  }
}