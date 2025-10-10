import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// POST - Criar novo curso (para admins e instrutores)
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Universal courses POST endpoint called')
    
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

    const { 
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
    } = body

    // Validação básica
    if (!title || !categoryId) {
      console.log('❌ Missing required fields:', { title: !!title, categoryId: !!categoryId })
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    // Determinar instructorId baseado no role
    let finalInstructorId = instructorId
    
    if (userRole === 'INSTRUCTOR') {
      // Para instrutores, usar o próprio ID
      finalInstructorId = session.user.id
    } else if (userRole === 'ADMIN') {
      // Para admins, usar o instructorId fornecido ou o próprio ID se não fornecido
      finalInstructorId = instructorId || session.user.id
    }

    console.log('👨‍🏫 Final instructor ID:', finalInstructorId)

    // Calcular escudos automaticamente: floor(Preço_em_reais / 0,50)
    const calculatedEscudos = Math.floor((price || 0) / 0.50)
    const finalEscudosPrice = escudosPrice || calculatedEscudos

    console.log('💰 Price calculation:', { price, escudosPrice, finalEscudosPrice })

    const nowIso = new Date().toISOString()
    const courseId = `course_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    console.log('🆔 Generated course ID:', courseId)

    console.log('🔗 Creating course in Supabase...')
    
    // Criar curso
    const { data: created, error: createErr } = await supabaseAdmin
      .from('Course')
      .insert({
        id: courseId,
        title,
        description: description || '',
        shortDescription: shortDescription || '',
        price: price || 0,
        escudosPrice: finalEscudosPrice,
        duration: duration || 0,
        categoryId,
        instructorId: finalInstructorId,
        coverImage: coverImage || '',
        difficulty: difficulty || 'BEGINNER',
        status: status || 'ACTIVE',
        courseType: courseType || 'COURSE',
        startDate: startDate || nowIso,
        isPublished: isPublished || false,
        approvalStatus: userRole === 'ADMIN' ? 'APPROVED' : 'PENDING',
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    console.log('📊 Course creation result:', { created: !!created, error: createErr?.message })

    if (createErr) {
      console.error('❌ Error creating course:', createErr)
      return NextResponse.json({ 
        error: 'Failed to create course',
        debug: { supabaseError: createErr.message }
      }, { status: 500 })
    }

    console.log('✅ Course created successfully:', created?.id)
    return NextResponse.json({
      success: true,
      course: created,
      debug: {
        courseId: created?.id,
        title,
        instructorId: finalInstructorId,
        userRole,
        approvalStatus: created?.approvalStatus
      }
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error in universal courses POST:', error)
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
