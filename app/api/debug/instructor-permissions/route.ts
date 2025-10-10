import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Debug para verificar permissões de instrutores
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug instructor permissions endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session details:', {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: (session?.user as any)?.role
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

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

    // Verificar se o usuário é instrutor
    const { data: user, error: userErr } = await supabaseAdmin
      .from('User')
      .select('id, email, role')
      .eq('id', session.user.id)
      .single()

    console.log('👤 User data:', { user, error: userErr?.message })

    // Verificar se existe registro na tabela Instructor
    const { data: instructor, error: instructorErr } = await supabaseAdmin
      .from('Instructor')
      .select('id, email, name')
      .eq('email', session.user.email)
      .single()

    console.log('👨‍🏫 Instructor data:', { instructor, error: instructorErr?.message })

    return NextResponse.json({
      success: true,
      debug: {
        session: {
          userId: session.user.id,
          userEmail: session.user.email,
          userRole: (session.user as any)?.role
        },
        course: course,
        user: user,
        instructor: instructor,
        courseMatch: course?.instructorId === session.user.id,
        instructorEmailMatch: instructor?.email === session.user.email
      }
    })
  } catch (error) {
    console.error('❌ Error in debug instructor permissions:', error)
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
