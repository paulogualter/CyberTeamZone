import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar módulos de um curso (para admins e instrutores)
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Universal modules GET endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      console.log('❌ Not authorized role')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    console.log('📚 Course ID:', courseId)

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Se for instrutor, verificar se o curso pertence a ele
    if (userRole === 'INSTRUCTOR') {
      const { data: course, error: courseErr } = await supabaseAdmin
        .from('Course')
        .select('id, instructorId')
        .eq('id', courseId)
        .eq('instructorId', session.user.id)
        .single()

      if (courseErr || !course) {
        console.log('❌ Course not found or access denied for instructor:', courseErr?.message)
        return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 })
      }
    }

    console.log('🔗 Fetching modules from Supabase...')
    
    // Buscar módulos do curso
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select(`
        *,
        lessons:Lesson(*),
        course:Course(id, title, instructorId, instructor:User(name, email))
      `)
      .eq('courseId', courseId)
      .order('order', { ascending: true })

    console.log('📊 Supabase result:', { modules: modules?.length || 0, error: modErr?.message })

    if (modErr) {
      console.error('❌ Error fetching modules:', modErr)
      return NextResponse.json({ 
        error: 'Failed to fetch modules',
        debug: { supabaseError: modErr.message }
      }, { status: 500 })
    }

    console.log('✅ Modules fetched successfully:', modules?.length || 0)
    return NextResponse.json({ 
      success: true, 
      modules: modules || [],
      debug: {
        courseId,
        modulesCount: modules?.length || 0,
        userRole
      }
    })
  } catch (error) {
    console.error('❌ Error in universal modules GET:', error)
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

// POST - Criar novo módulo (para admins e instrutores)
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Universal modules POST endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      console.log('❌ Not authorized role')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    console.log('📝 Request body:', body)

    const { title, description, order, courseId } = body

    // Validação básica
    if (!title || !courseId) {
      console.log('❌ Missing required fields:', { title: !!title, courseId: !!courseId })
      return NextResponse.json(
        { error: 'Title and courseId are required' },
        { status: 400 }
      )
    }

    console.log('🔍 Verifying course exists...')
    
    // Verificar se o curso existe
    let courseQuery = supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', courseId)

    // Se for instrutor, verificar se o curso pertence a ele
    if (userRole === 'INSTRUCTOR') {
      courseQuery = courseQuery.eq('instructorId', session.user.id)
    }

    const { data: course, error: courseErr } = await courseQuery.single()

    console.log('📊 Course verification:', { course: !!course, error: courseErr?.message })

    if (courseErr || !course) {
      console.log('❌ Course not found:', courseErr?.message)
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Próxima ordem se não informada
    let moduleOrder = order as number | undefined
    if (!moduleOrder) {
      console.log('🔍 Getting next order...')
      const { data: last, error: lastErr } = await supabaseAdmin
        .from('Module')
        .select('order')
        .eq('courseId', courseId)
        .order('order', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (lastErr) {
        console.warn('Could not get last module order:', lastErr)
      }
      moduleOrder = last?.order ? (Number(last.order) + 1) : 1
      console.log('📊 Next order:', moduleOrder)
    }

    const nowIso = new Date().toISOString()
    const moduleId = `module_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    console.log('🆔 Generated module ID:', moduleId)

    console.log('🔗 Creating module in Supabase...')
    
    // Criar módulo
    const { data: created, error: createErr } = await supabaseAdmin
      .from('Module')
      .insert({
        id: moduleId,
        title,
        description: description || '',
        courseId,
        order: moduleOrder,
        isPublished: false,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*, lessons:Lesson(*)')
      .single()

    console.log('📊 Module creation result:', { created: !!created, error: createErr?.message })

    if (createErr) {
      console.error('❌ Error creating module:', createErr)
      return NextResponse.json({ 
        error: 'Failed to create module',
        debug: { supabaseError: createErr.message }
      }, { status: 500 })
    }

    console.log('✅ Module created successfully:', created?.id)
    return NextResponse.json({
      success: true,
      module: created,
      debug: {
        moduleId: created?.id,
        courseId,
        title,
        userRole
      }
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error in universal modules POST:', error)
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
