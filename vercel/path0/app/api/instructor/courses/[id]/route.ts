import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Buscar curso específico do instrutor
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é instrutor (tentar por id, fallback por email)
    let { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('role,email')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      const fallback = await supabaseAdmin
        .from('User')
        .select('role,email')
        .eq('email', session.user.email || '')
        .single()
      user = fallback.data as any
      userError = fallback.error as any
    }

    if (userError || !user || user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Resolver instructorId pelo e-mail
    const { data: instructorRow, error: instructorErr } = await supabaseAdmin
      .from('Instructor')
      .select('id,email')
      .eq('email', user.email)
      .single()

    if (instructorErr || !instructorRow) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    // Buscar o curso pertencente ao instrutor
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select(`
        *,
        instructor:Instructor(id,name,email),
        category:Category(id,name),
        modules:Module(id,title,order,lessons:Lesson(id,title,order))
      `)
      .eq('id', params.id)
      .eq('instructorId', instructorRow.id)
      .single()

    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      course
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar curso
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é instrutor
    let { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('role,email')
      .eq('id', session.user.id)
      .single()
    if (userError || !user) {
      const fallback = await supabaseAdmin
        .from('User')
        .select('role,email')
        .eq('email', session.user.email || '')
        .single()
      user = fallback.data as any
      userError = fallback.error as any
    }

    if (userError || !user || user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, description, shortDescription, price, escudosPrice, duration, categoryId, coverImage, status } = await req.json()

    // Resolver instructorId
    const { data: instructorRow, error: instructorErr } = await supabaseAdmin
      .from('Instructor')
      .select('id,email')
      .eq('email', user.email)
      .single()
    if (instructorErr || !instructorRow) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    // Verificar se o curso pertence ao instrutor
    const { data: existingCourse, error: existingErr } = await supabaseAdmin
      .from('Course')
      .select('id')
      .eq('id', params.id)
      .eq('instructorId', instructorRow.id)
      .single()

    if (existingErr || !existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Atualizar curso
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('Course')
      .update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(price !== undefined && { price }),
        ...(escudosPrice !== undefined && { escudosPrice }),
        ...(duration !== undefined && { duration }),
        ...(categoryId && { categoryId }),
        ...(coverImage !== undefined && { coverImage }),
        ...(status && { status }),
        updatedAt: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('instructorId', instructorRow.id)
      .select(`*, instructor:Instructor(id,name,email), category:Category(id,name)`) 
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      course: updated
    })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir curso
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é instrutor
    let { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('role,email')
      .eq('id', session.user.id)
      .single()
    if (userError || !user) {
      const fallback = await supabaseAdmin
        .from('User')
        .select('role,email')
        .eq('email', session.user.email || '')
        .single()
      user = fallback.data as any
      userError = fallback.error as any
    }

    if (userError || !user || user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Resolver instructorId
    const { data: instructorRow, error: instructorErr } = await supabaseAdmin
      .from('Instructor')
      .select('id,email')
      .eq('email', user.email)
      .single()
    if (instructorErr || !instructorRow) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    // Verificar se o curso pertence ao instrutor
    const { data: existingCourse, error: existingErr } = await supabaseAdmin
      .from('Course')
      .select('id')
      .eq('id', params.id)
      .eq('instructorId', instructorRow.id)
      .single()

    if (existingErr || !existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Excluir curso
    const { error: deleteErr } = await supabaseAdmin
      .from('Course')
      .delete()
      .eq('id', params.id)
      .eq('instructorId', instructorRow.id)
    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
