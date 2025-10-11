import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Debug detalhado da sessão e permissões
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Detailed session debug endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session details:', {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: (session?.user as any)?.role,
      sessionExpires: session?.expires
    })
    
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    console.log('📚 Course ID:', courseId)

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Verificar o curso
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, title, instructorId')
      .eq('id', courseId)
      .single()

    console.log('📊 Course data:', { course, error: courseErr?.message })

    // Verificar se o usuário existe na tabela User
    let userData = null
    let userError = null
    if (session?.user?.id) {
      const { data: user, error: userErr } = await supabaseAdmin
        .from('User')
        .select('id, email, role, name')
        .eq('id', session.user.id)
        .single()
      
      userData = user
      userError = userErr
    }

    console.log('👤 User data:', { userData, userError: userError?.message })

    // Verificar se existe registro na tabela Instructor
    let instructorData = null
    let instructorError = null
    if (session?.user?.email) {
      const { data: instructor, error: instructorErr } = await supabaseAdmin
        .from('Instructor')
        .select('id, email, name')
        .eq('email', session.user.email)
        .single()
      
      instructorData = instructor
      instructorError = instructorErr
    }

    console.log('👨‍🏫 Instructor data:', { instructorData, instructorError: instructorError?.message })

    // Verificar módulos do curso
    const { data: modules, error: modulesErr } = await supabaseAdmin
      .from('Module')
      .select('id, title, courseId, instructorId')
      .eq('courseId', courseId)

    console.log('📚 Modules data:', { modules: modules?.length || 0, error: modulesErr?.message })

    // Verificar permissões
    const hasPermission = session?.user?.id && (
      (session.user as any)?.role === 'ADMIN' || 
      (course?.instructorId === session.user.id)
    )

    return NextResponse.json({
      success: true,
      debug: {
        session: {
          exists: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          userRole: (session?.user as any)?.role,
          sessionExpires: session?.expires
        },
        course: {
          data: course,
          error: courseErr?.message
        },
        user: {
          data: userData,
          error: userError?.message
        },
        instructor: {
          data: instructorData,
          error: instructorError?.message
        },
        modules: {
          count: modules?.length || 0,
          data: modules,
          error: modulesErr?.message
        },
        permissions: {
          hasPermission,
          isAdmin: (session?.user as any)?.role === 'ADMIN',
          isInstructor: (session?.user as any)?.role === 'INSTRUCTOR',
          courseBelongsToUser: course?.instructorId === session?.user?.id,
          userIdMatchesCourseInstructor: course?.instructorId === session?.user?.id
        }
      }
    })
  } catch (error) {
    console.error('❌ Error in detailed session debug:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}
