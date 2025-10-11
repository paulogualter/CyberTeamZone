import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar aulas de um módulo (para admins)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const userRole = (session.user as any)?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId')

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Buscar aulas do módulo (admins podem ver todas)
    const { data: lessons, error: lessonErr } = await supabaseAdmin
      .from('Lesson')
      .select('*')
      .eq('moduleId', moduleId)
      .order('order', { ascending: true })

    if (lessonErr) {
      console.error('Error fetching lessons:', lessonErr)
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
    }

    return NextResponse.json({ success: true, lessons: lessons || [] })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar nova aula (para admins)
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Admin lessons POST endpoint called')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session exists:', !!session)
    
    if (!session?.user?.id) {
      console.log('❌ No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const userRole = (session.user as any)?.role
    console.log('👤 User role:', userRole)
    
    if (userRole !== 'ADMIN') {
      console.log('❌ Not an admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { 
      title, 
      description, 
      content, 
      videoUrl, 
      duration, 
      order, 
      moduleId,
      isPublished = false 
    } = await req.json()

    console.log('📝 Request data:', { title, moduleId, order })

    // Validação básica
    if (!title || !moduleId) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Title and moduleId are required' },
        { status: 400 }
      )
    }

    console.log('🔍 Verifying module exists...')
    
    // Verificar se o módulo existe usando queries separadas
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', moduleId)
      .single()

    console.log('📊 Module verification:', { module: !!module, error: moduleErr?.message })

    if (moduleErr || !module) {
      console.log('❌ Module not found:', moduleErr?.message)
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    console.log('🔍 Verifying course exists...')
    
    // Buscar dados do curso separadamente
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', module.courseId)
      .single()

    console.log('📊 Course verification:', { course: !!course, error: courseErr?.message })

    if (courseErr || !course) {
      console.log('❌ Course not found:', courseErr?.message)
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    console.log('🔍 Getting next order...')
    
    // Próxima ordem se não informada
    let lessonOrder = order as number | undefined
    if (!lessonOrder) {
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
    }
    
    console.log('📊 Next order:', lessonOrder)

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
        videoUrl: videoUrl || '',
        duration: duration || 0,
        moduleId,
        order: lessonOrder,
        isPublished,
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
        nextOrder: lessonOrder
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}