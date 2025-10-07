import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Listar cursos pendentes de aprovação
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: user, error: userErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userErr || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const { data: courses, error, count } = await supabaseAdmin
      .from('Course')
      .select('*, instructor:Instructor(*), category:Category(*)', { count: 'exact' })
      .eq('approvalStatus', status)
      .order('submittedForApprovalAt', { ascending: false })
      .range(skip, skip + limit - 1)

    if (error) {
      console.error('Error fetching courses for approval:', error)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      courses: courses || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching courses for approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Aprovar ou rejeitar curso
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: user, error: userErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userErr || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { courseId, action, rejectionReason } = await req.json()

    if (!courseId || !action) {
      return NextResponse.json(
        { error: 'Course ID and action are required' },
        { status: 400 }
      )
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      )
    }

    // Verificar se o curso existe
    const { data: course, error: getErr } = await supabaseAdmin
      .from('Course')
      .select('id, approvalStatus')
      .eq('id', courseId)
      .single()

    if (getErr || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.approvalStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Course is not pending approval' },
        { status: 400 }
      )
    }

    // Atualizar curso
    const updateData: any = {
      approvedBy: session.user.id,
      updatedAt: new Date().toISOString()
    }

    if (action === 'APPROVE') {
      updateData.approvalStatus = 'APPROVED'
      updateData.approvedAt = new Date().toISOString()
      updateData.isPublished = true // Publicar automaticamente quando aprovado
      updateData.rejectionReason = null
    } else {
      updateData.approvalStatus = 'REJECTED'
      updateData.rejectionReason = rejectionReason || 'Rejeitado pelo administrador'
    }

    const { data: updatedCourse, error: updErr } = await supabaseAdmin
      .from('Course')
      .update(updateData)
      .eq('id', courseId)
      .select('*, instructor:Instructor(*), category:Category(*)')
      .single()

    if (updErr) {
      console.error('Error updating course approval:', updErr)
      return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      course: updatedCourse,
      message: action === 'APPROVE' 
        ? 'Curso aprovado com sucesso!' 
        : 'Curso rejeitado com sucesso!'
    })
  } catch (error) {
    console.error('Error updating course approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
