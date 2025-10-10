import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar módulos de um curso (para instrutores)
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Instructor modules GET endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (userRole !== 'INSTRUCTOR') {
      console.log('❌ Not an instructor')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    console.log('📚 Course ID:', courseId)

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Verificar se o curso pertence ao instrutor
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', courseId)
      .eq('instructorId', session.user.id)
      .single()

    if (courseErr || !course) {
      console.log('❌ Course not found or access denied:', courseErr?.message)
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 })
    }

    // Buscar módulos do curso
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select(`
        *,
        lessons:Lesson(*)
      `)
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    if (modErr) {
      console.error('❌ Error fetching modules:', modErr)
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
    }

    console.log('✅ Modules fetched successfully:', modules?.length || 0)
    return NextResponse.json({ success: true, modules: modules || [] })
  } catch (error) {
    console.error('❌ Error in instructor modules GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Criar novo módulo (para instrutores)
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Instructor modules POST endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (userRole !== 'INSTRUCTOR') {
      console.log('❌ Not an instructor')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    console.log('📝 Request body:', body)

    const { courseId, title, description, order } = body

    if (!courseId || !title) {
      return NextResponse.json({ error: 'Course ID and title are required' }, { status: 400 })
    }

    // Verificar se o curso pertence ao instrutor
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', courseId)
      .eq('instructorId', session.user.id)
      .single()

    if (courseErr || !course) {
      console.log('❌ Course not found or access denied:', courseErr?.message)
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 })
    }

    // Criar módulo
    const { data: module, error: modErr } = await supabaseAdmin
      .from('Module')
      .insert({
        courseId,
        title,
        description: description || '',
        order: order || 0,
        isPublished: false
      })
      .select()
      .single()

    if (modErr) {
      console.error('❌ Error creating module:', modErr)
      return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
    }

    console.log('✅ Module created successfully:', module?.id)
    return NextResponse.json({ success: true, module }, { status: 201 })
  } catch (error) {
    console.error('❌ Error in instructor modules POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}