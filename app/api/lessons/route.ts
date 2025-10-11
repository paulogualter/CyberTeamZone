import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar aulas de um módulo (para admins e instrutores)
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Universal lessons GET endpoint called')
    
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
    const moduleId = searchParams.get('moduleId')
    console.log('📚 Module ID:', moduleId)

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Se for instrutor, verificar se o módulo pertence a um curso dele
    if (userRole === 'INSTRUCTOR') {
      // Primeiro, buscar o módulo
      const { data: module, error: moduleErr } = await supabaseAdmin
        .from('Module')
        .select('id, courseId')
        .eq('id', moduleId)
        .single()

      if (moduleErr || !module) {
        console.log('❌ Module not found:', moduleErr?.message)
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }

      // Depois, verificar se o curso pertence ao instrutor
      const { data: course, error: courseErr } = await supabaseAdmin
        .from('Course')
        .select('id, instructorId')
        .eq('id', module.courseId)
        .single()

      if (courseErr || !course || course.instructorId !== session.user.id) {
        console.log('❌ Course not found or access denied for instructor:', courseErr?.message)
        return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 })
      }
    }

    console.log('🔗 Fetching lessons from Supabase...')
    
    // Buscar aulas do módulo
    const { data: lessons, error: lessonsErr } = await supabaseAdmin
      .from('Lesson')
      .select(`
        *,
        module:Module(id, title, courseId, course:Course(id, title, instructorId))
      `)
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    console.log('📊 Supabase result:', { lessons: lessons?.length || 0, error: lessonsErr?.message })

    if (lessonsErr) {
      console.error('❌ Error fetching lessons:', lessonsErr)
      return NextResponse.json({ 
        error: 'Failed to fetch lessons',
        debug: { supabaseError: lessonsErr.message }
      }, { status: 500 })
    }

    console.log('✅ Lessons fetched successfully:', lessons?.length || 0)
    return NextResponse.json({ 
      success: true, 
      lessons: lessons || [],
      debug: {
        moduleId,
        lessonsCount: lessons?.length || 0,
        userRole
      }
    })
  } catch (error) {
    console.error('❌ Error in universal lessons GET:', error)
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

// POST - Criar nova aula (para admins e instrutores)
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Universal lessons POST endpoint called')
    
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

    const { title, description, content, order, moduleId, duration, videoUrl } = body

    // Validação básica
    if (!title || !moduleId) {
      console.log('❌ Missing required fields:', { title: !!title, moduleId: !!moduleId })
      return NextResponse.json(
        { error: 'Title and moduleId are required' },
        { status: 400 }
      )
    }

    console.log('🔍 Verifying module exists...')
    
    // Verificar se o módulo existe
    let moduleQuery = supabaseAdmin
      .from('Module')
      .select(`
        id,
        course:Course(id, instructorId)
      `)
      .eq('id', moduleId)

    // Se for instrutor, verificar se o módulo pertence a um curso dele
    if (userRole === 'INSTRUCTOR') {
      moduleQuery = moduleQuery.eq('course.instructorId', session.user.id)
    }

    const { data: module, error: moduleErr } = await moduleQuery.single()

    console.log('📊 Module verification:', { module: !!module, error: moduleErr?.message })

    if (moduleErr || !module) {
      console.log('❌ Module not found:', moduleErr?.message)
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    // Próxima ordem se não informada
    let lessonOrder = order as number | undefined
    if (!lessonOrder) {
      console.log('🔍 Getting next order...')
      const { data: last, error: lastErr } = await supabaseAdmin
        .from('Lesson')
        .select('order')
        .eq('moduleId', moduleId)
        .order('order', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (lastErr) {
        console.warn('Could not get last lesson order:', lastErr)
      }
      lessonOrder = last?.order ? (Number(last.order) + 1) : 1
      console.log('📊 Next order:', lessonOrder)
    }

    const nowIso = new Date().toISOString()
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    console.log('🆔 Generated lesson ID:', lessonId)

    console.log('🔗 Creating lesson in Supabase...')
    
    // Criar aula
    const { data: created, error: createErr } = await supabaseAdmin
      .from('Lesson')
      .insert({
        id: lessonId,
        title,
        description: description || '',
        content: content || '',
        moduleId,
        order: lessonOrder,
        duration: duration || 0,
        videoUrl: videoUrl || '',
        isPublished: false,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    console.log('📊 Lesson creation result:', { created: !!created, error: createErr?.message })

    if (createErr) {
      console.error('❌ Error creating lesson:', createErr)
      return NextResponse.json({ 
        error: 'Failed to create lesson',
        debug: { supabaseError: createErr.message }
      }, { status: 500 })
    }

    console.log('✅ Lesson created successfully:', created?.id)
    return NextResponse.json({
      success: true,
      lesson: created,
      debug: {
        lessonId: created?.id,
        moduleId,
        title,
        userRole
      }
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error in universal lessons POST:', error)
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
