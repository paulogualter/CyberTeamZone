import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar cursos do instrutor
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é instrutor (tentar por id; se falhar, por email)
    let { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('role, email')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      const fallback = await supabaseAdmin
        .from('User')
        .select('role, email')
        .eq('email', session.user.email || '')
        .single()
      user = fallback.data as any
      userError = fallback.error as any
    }

    if (userError || !user || user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Buscar o registro do instrutor pelo e-mail do usuário logado
    const { data: instructorRow, error: instructorByEmailError } = await supabaseAdmin
      .from('Instructor')
      .select('id')
      .eq('email', user.email)
      .single()

    if (instructorByEmailError || !instructorRow) {
      return NextResponse.json({ error: 'Instructor not found for this user' }, { status: 404 })
    }

    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('Course')
      .select(`
        *,
        instructor:Instructor(id, name, email),
        category:Category(id, name),
        modules:Module(id, title, lessons:Lesson(id))
      `)
      .eq('instructorId', instructorRow.id)
      .order('createdAt', { ascending: false })

    if (coursesError) {
      console.error('Error fetching instructor courses:', coursesError)
      throw coursesError
    }

    // Transformar dados para incluir contagens
    const coursesWithCount = (courses || []).map((course: any) => ({
      ...course,
      lessonsCount: (course.modules || []).reduce((sum: number, module: any) => sum + ((module.lessons || []).length), 0),
      enrolledCount: 0
    }))

    return NextResponse.json({
      success: true,
      courses: coursesWithCount
    })
  } catch (error) {
    console.error('Error fetching instructor courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar novo curso
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 POST /api/instructor/courses - Iniciando...')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session:', session ? 'Found' : 'Not found')
    console.log('👤 User ID:', session?.user?.id)
    console.log('📧 User Email:', session?.user?.email)
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é instrutor (tentar por id; se falhar, por email)
    let { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('role, email')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      const fallback = await supabaseAdmin
        .from('User')
        .select('role, email')
        .eq('email', session.user.email || '')
        .single()
      user = fallback.data as any
      userError = fallback.error as any
    }
    
    console.log('👤 User found:', user)
    console.log('🎭 User role:', user?.role)

    if (userError || !user || user.role !== 'INSTRUCTOR') {
      console.log('❌ Forbidden: User is not an instructor')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, description, shortDescription, price, escudosPrice, duration, categoryId, instructorId, coverImage, difficulty, status, courseType, startDate, isPublished } = await req.json()

    // Validação básica (instrutor é resolvido pelo backend)
    if (!title || !categoryId) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    // Calcular escudos automaticamente: floor(Preço_em_reais / 0,50)
    const calculatedEscudos = Math.floor(parseFloat(price || 0) / 0.50)
    const finalEscudosPrice = escudosPrice ? parseInt(escudosPrice) : calculatedEscudos

    // Debug: validar dados recebidos
    console.log('Received data:', {
      title: typeof title,
      categoryId: typeof categoryId,
      difficulty,
      status,
      isPublished: typeof isPublished
    })

    console.log('Creating course with data:', {
      title,
      description,
      shortDescription,
      price,
      escudosPrice,
      duration,
      categoryId,
      instructorId,
      coverImage,
      difficulty,
      status,
      courseType,
      startDate,
      isPublished
    })

    // Verificar se a categoria existe
    const { data: category, error: categoryError } = await supabaseAdmin
      .from('Category')
      .select('id')
      .eq('id', categoryId)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Resolver instrutor: usar instructorId fornecido ou derivar pelo e-mail do usuário
    let effectiveInstructorId = instructorId as string | null
    if (!effectiveInstructorId) {
      const { data: instrByEmail, error: instrByEmailErr } = await supabaseAdmin
        .from('Instructor')
        .select('id')
        .eq('email', user.email)
        .single()
      if (instrByEmailErr || !instrByEmail) {
        console.log('❌ Instrutor não encontrado para o usuário:', user.email)
        return NextResponse.json(
          { error: 'Instructor not found for current user' },
          { status: 404 }
        )
      }
      effectiveInstructorId = instrByEmail.id
    } else {
      // Validar se o ID existe
      const { data: instrById, error: instrByIdErr } = await supabaseAdmin
        .from('Instructor')
        .select('id')
        .eq('id', effectiveInstructorId)
        .single()
      if (instrByIdErr || !instrById) {
        console.log('❌ Instrutor (ID) não encontrado:', effectiveInstructorId)
        return NextResponse.json(
          { error: 'Instructor not found' },
          { status: 404 }
        )
      }
    }

    console.log('✅ Instrutor resolvido:', effectiveInstructorId)

    // Criar curso com dados mínimos - teste step by step
    try {
      console.log('Tentando criar curso...')
      
      // Normalizações e validações
      const normalizedCourseType = String(courseType || 'RECORDED').toUpperCase()
      const isLiveType = normalizedCourseType === 'ONLINE' || normalizedCourseType === 'HYBRID'
      let startDateIso: string | null = null
      if (isLiveType && startDate) {
        try {
          const d = new Date(startDate)
          if (!isNaN(d.getTime())) startDateIso = d.toISOString()
        } catch {}
      }

      // Normalizar enums com fallback seguro
      const allowedDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
      const normalizedDifficulty = allowedDifficulties.includes(String(difficulty || '').toUpperCase())
        ? String(difficulty).toUpperCase()
        : 'BEGINNER'

      const allowedStatus = ['ACTIVE', 'INACTIVE', 'ARCHIVED']
      const normalizedStatus = allowedStatus.includes(String(status || '').toUpperCase())
        ? String(status).toUpperCase()
        : 'ACTIVE'

      // Gerar ID e timestamps explícitos, já que a coluna id é NOT NULL
      const courseId = `course_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      const nowIso = new Date().toISOString()

      const { data: course, error: createCourseError } = await supabaseAdmin
        .from('Course')
        .insert({
          id: courseId,
          title: title.trim(),
          description: (description || '').trim(),
          shortDescription: (shortDescription || '').trim(),
          price: parseFloat(price) || 0,
          escudosPrice: finalEscudosPrice,
          duration: parseInt(duration) || 0,
          coverImage: (coverImage || '').trim(),
          status: normalizedStatus as any,
          difficulty: normalizedDifficulty as any,
          courseType: normalizedCourseType as any,
          startDate: startDateIso,
          isPublished: false, // Sempre false até ser aprovado
          approvalStatus: 'PENDING', // Sempre PENDING para instrutores
          submittedForApprovalAt: nowIso,
          createdAt: nowIso,
          updatedAt: nowIso,
          instructorId: effectiveInstructorId,
          categoryId: category.id
        })
        .select(`
          *,
          instructor:Instructor(id, name, email),
          category:Category(id, name)
        `)
        .single()
      
      if (createCourseError) {
        console.error('Erro ao criar curso no Supabase:', createCourseError)
        throw createCourseError
      }

      console.log('Curso criado com sucesso:', course)
      
      return NextResponse.json({
        success: true,
        course
      }, { status: 201 })
      
    } catch (createError) {
      console.error('Erro ao criar curso:', createError)
      console.error('Detalhes do erro:', {
        message: (createError as Error).message,
        stack: (createError as Error).stack,
        name: (createError as Error).name
      })
      
      return NextResponse.json(
        { error: 'Failed to create course', details: (createError as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating course:', error)
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    })
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
