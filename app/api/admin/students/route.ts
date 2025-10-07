import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// GET - Listar todos os alunos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: currentUser, error: userErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userErr || currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('User')
      .select('id,name,email,role,isActive,escudos,subscriptionStatus,subscriptionPlan,createdAt,updatedAt', { count: 'exact' })
      .eq('role', 'STUDENT')
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1)

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (status && status !== 'all') {
      query = query.eq('isActive', status === 'active')
    }

    const { data: students, count: totalCount, error: studentsErr } = await query
    if (studentsErr) {
      console.error('Error fetching students:', studentsErr)
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    // Get student metrics
    const { count: totalStudents } = await supabaseAdmin
      .from('User')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'STUDENT')

    const { count: studentsWithActiveSubscription } = await supabaseAdmin
      .from('User')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'STUDENT')
      .eq('subscriptionStatus', 'ACTIVE')

    const total = Number(totalStudents ?? 0)
    const withActive = Number(studentsWithActiveSubscription ?? 0)
    const studentsWithoutActiveSubscription = total - withActive

    return NextResponse.json({
      success: true,
      students,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil((totalCount || 0) / limit)
      },
      metrics: {
        totalStudents: total,
        studentsWithActiveSubscription: withActive,
        studentsWithoutActiveSubscription
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar aluno
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: currentUser, error: userErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userErr || currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { studentId, isActive, escudos, subscriptionStatus, subscriptionPlan } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    // Verificar se o aluno existe e é realmente um aluno
    const { data: student } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', studentId)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'User is not a student' }, { status: 400 })
    }

    // Atualizar aluno
    const updateData: any = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (escudos !== undefined) updateData.escudos = parseInt(escudos)
    if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus
    if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan

    const { data: updatedStudent, error: updateErr } = await supabaseAdmin
      .from('User')
      .update(updateData)
      .eq('id', studentId)
      .select('id,name,email,role,isActive,escudos,subscriptionStatus,subscriptionPlan')
      .single()
    
    if (updateErr) {
      console.error('Error updating student:', updateErr)
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      student: updatedStudent
    })
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Redefinir senha do aluno
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: currentUser, error: userErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userErr || currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { studentId, newPassword } = await req.json()

    if (!studentId || !newPassword) {
      return NextResponse.json({ 
        error: 'Student ID and new password are required' 
      }, { status: 400 })
    }

    // Verificar se o aluno existe e é realmente um aluno
    const { data: student } = await supabaseAdmin
      .from('User')
      .select('role,email')
      .eq('id', studentId)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'User is not a student' }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Atualizar senha
    const { error: passErr } = await supabaseAdmin
      .from('User')
      .update({ password: hashedPassword })
      .eq('id', studentId)
    if (passErr) {
      console.error('Error updating password:', passErr)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
