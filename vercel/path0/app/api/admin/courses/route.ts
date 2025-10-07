import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar todos os cursos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const instructor = searchParams.get('instructor')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { instructor: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (category && category !== 'all') {
      where.categoryId = category
    }

    if (instructor && instructor !== 'all') {
      where.instructorId = instructor
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // Build Supabase query with filters and pagination
    let query = supabaseAdmin
      .from('Course')
      .select(`
        *,
        category:Category(*),
        instructor:Instructor(*),
        modules:Module(*, lessons:Lesson(*))
      `, { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1)

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }
    if (category && category !== 'all') {
      query = query.eq('categoryId', category)
    }
    if (instructor && instructor !== 'all') {
      query = query.eq('instructorId', instructor)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: courses, error, count } = await query
    if (error) {
      console.error('Supabase error fetching courses:', error)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    const coursesWithStats = (courses || []).map((course: any) => ({
      ...course,
      lessonsCount: Array.isArray(course.modules)
        ? course.modules.reduce((total: number, m: any) => total + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0)
        : 0
    }))

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      courses: coursesWithStats,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar novo curso
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      shortDescription,
      description,
      price,
      escudosPrice,
      difficulty,
      duration,
      categoryId,
      instructorId,
      coverImage,
      isPublished,
      status = 'ACTIVE'
    } = body

    // Validar dados obrigatórios
    if (!title || !shortDescription || !price || !difficulty || !duration || !categoryId || !instructorId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Calcular escudos automaticamente: floor(Preço_em_reais / 0,50)
    const calculatedEscudos = Math.floor(parseFloat(price) / 0.50)
    const finalEscudosPrice = escudosPrice ? parseInt(escudosPrice) : calculatedEscudos

    // Verificar se a categoria existe
    const { data: category, error: catErr } = await supabaseAdmin
      .from('Category')
      .select('id')
      .eq('id', categoryId)
      .single()

    if (catErr || !category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 400 }
      )
    }

    // Verificar se o instrutor existe
    const { data: instructor, error: instErr } = await supabaseAdmin
      .from('Instructor')
      .select('id')
      .eq('id', instructorId)
      .single()

    if (instErr || !instructor) {
      return NextResponse.json(
        { error: 'Instrutor não encontrado' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const { data: created, error: createErr } = await supabaseAdmin
      .from('Course')
      .insert({
        id: `course_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
        title,
        shortDescription: shortDescription ? shortDescription.substring(0, 60) : null,
        description: description || '',
        price: parseFloat(price),
        escudosPrice: finalEscudosPrice,
        difficulty,
        duration: parseInt(duration),
        categoryId,
        instructorId,
        coverImage: coverImage || '',
        isPublished: !!isPublished,
        status: status || 'ACTIVE',
        createdAt: now,
        updatedAt: now
      })
      .select('*, category:Category(*), instructor:Instructor(*)')
      .single()

    if (createErr) {
      console.error('Supabase error creating course:', createErr)
      return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      course: created
    })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
