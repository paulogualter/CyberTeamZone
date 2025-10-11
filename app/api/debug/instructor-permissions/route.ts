import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug instructor permissions endpoint called')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session found',
        debug: 'User not authenticated'
      }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    
    if (userRole !== 'INSTRUCTOR') {
      return NextResponse.json({ 
        error: 'User is not an instructor',
        debug: `User role: ${userRole}`,
        session: {
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: userRole
        }
      }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    
    if (!courseId) {
      return NextResponse.json({ 
        error: 'Course ID is required'
      }, { status: 400 })
    }

    // Verificar se o curso existe e pertence ao instrutor
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, title, instructorId')
      .eq('id', courseId)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ 
        error: 'Course not found',
        debug: courseErr?.message,
        courseId: courseId
      }, { status: 404 })
    }

    if (course.instructorId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Access denied',
        debug: `Course instructorId (${course.instructorId}) does not match session userId (${session.user.id})`,
        courseId: courseId,
        courseTitle: course.title
      }, { status: 403 })
    }

    return NextResponse.json({ 
      success: true,
      debug: {
        session: {
          userId: session.user.id,
          userName: session.user.name,
          userRole: userRole
        },
        course: {
          id: course.id,
          title: course.title,
          instructorId: course.instructorId
        }
      }
    })

  } catch (error) {
    console.error('❌ Error in debug instructor permissions:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}