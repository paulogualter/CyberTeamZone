import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
// Updated: Migrated from Prisma to Supabase


// GET - Listar todos os usuários
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin (via Supabase)
    const { data: currentUser, error: currentUserError } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (currentUserError || currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const role = searchParams.get('role')

    // Buscar usuários no Supabase (admins e instrutores)
    let query = supabaseAdmin
      .from('User')
      .select('id, name, email, role, isActive, createdAt, updatedAt, escudos, subscriptionStatus, subscriptionPlan')
      .in('role', ['ADMIN', 'INSTRUCTOR'])

    if (role && role !== 'all' && ['ADMIN', 'INSTRUCTOR'].includes(role)) {
      query = supabaseAdmin
        .from('User')
        .select('id, name, email, role, isActive, createdAt, updatedAt, escudos, subscriptionStatus, subscriptionPlan')
        .eq('role', role)
    }

    const { data: allUsersData, error: usersError } = await query
    if (usersError) {
      throw usersError
    }

    // Filtro de busca (lado do servidor)
    let filtered = allUsersData || []
    if (search) {
      const term = search.toLowerCase()
      filtered = filtered.filter(u => (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term))
    }

    // Ordenar por createdAt desc
    filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / limit)
    const start = (page - 1) * limit
    const end = start + limit
    const pageItems = filtered.slice(start, end)

    // Adaptar _count esperado no frontend
    const users = pageItems.map((u: any) => ({
      ...u,
      _count: { enrollments: 0, payments: 0 }
    }))

    return NextResponse.json({
      success: true,
      users,
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
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar usuário (role, status, etc.)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin (via Supabase)
    const { data: currentUser, error: currentUserError } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (currentUserError || currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, role, isActive, escudos } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verificar se o usuário existe (Supabase)
    const { data: user, error: userFetchError } = await supabaseAdmin
      .from('User')
      .select('id, name, email, role, isActive, escudos')
      .eq('id', userId)
      .single()

    if (userFetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Montar payload de atualização
    const updateData: any = {}
    if (role) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
    if (escudos !== undefined) updateData.escudos = parseInt(escudos)

    // Atualizar usuário no Supabase
    const { data: updatedUsers, error: updateErr } = await supabaseAdmin
      .from('User')
      .update(updateData)
      .eq('id', userId)
      .select('id, name, email, role, isActive, escudos, subscriptionStatus, subscriptionPlan')
      
    if (updateErr || !updatedUsers || updatedUsers.length === 0) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    const updatedUser = updatedUsers[0]

    // Se o role foi alterado para INSTRUCTOR, sincronizar com a tabela Instructor
    if (role === 'INSTRUCTOR') {
      try {
        // Verificar se já existe um instrutor com este email (Supabase)
        const { data: existingInstructor } = await supabaseAdmin
          .from('Instructor')
          .select('id, name, isActive')
          .eq('email', user.email)
          .maybeSingle()

        if (!existingInstructor) {
          // Criar novo instrutor
          await supabaseAdmin
            .from('Instructor')
            .insert({
              name: user.name || 'Instrutor',
              email: user.email,
              bio: 'Instrutor do CyberTeam',
              avatar: null,
              expertise: JSON.stringify(['Cibersegurança']),
              socialLinks: JSON.stringify({}),
              isActive: true
            })
          console.log(`✅ Instrutor criado para ${user.email}`)
        } else {
          // Atualizar instrutor existente
          await supabaseAdmin
            .from('Instructor')
            .update({
              name: user.name || existingInstructor.name,
              isActive: isActive !== undefined ? isActive : existingInstructor.isActive
            })
            .eq('email', user.email)
          console.log(`✅ Instrutor atualizado para ${user.email}`)
        }
      } catch (instructorError) {
        console.error('Erro ao sincronizar instrutor:', instructorError)
        // Não falhar a operação principal, apenas logar o erro
      }
    }

    // Se o role foi alterado para STUDENT, desativar instrutor se existir
    if (role === 'STUDENT') {
      try {
        const { data: existingInstructor } = await supabaseAdmin
          .from('Instructor')
          .select('id')
          .eq('email', user.email)
          .maybeSingle()

        if (existingInstructor) {
          await supabaseAdmin
            .from('Instructor')
            .update({ isActive: false })
            .eq('email', user.email)
          console.log(`✅ Instrutor desativado para ${user.email}`)
        }
      } catch (instructorError) {
        console.error('Erro ao desativar instrutor:', instructorError)
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuário instrutor
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin (via Supabase)
    const { data: currentUser, error: currentUserErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
    if (currentUserErr) throw currentUserErr
    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, email, password } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Checar se já existe (Supabase)
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()
    if (existingErr) throw existingErr
    if (existing) {
      return NextResponse.json({ error: 'Já existe um usuário com este email' }, { status: 409 })
    }

    const now = new Date()
    const hashed = password ? await bcrypt.hash(password, 10) : null

    // Criar usuário como INSTRUCTOR (Supabase)
    const { data: createdRows, error: createErr } = await supabaseAdmin
      .from('User')
      .insert({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        password: hashed,
        role: 'INSTRUCTOR',
        isActive: true,
        subscriptionStatus: 'INACTIVE',
        escudos: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
      .select('id, name, email, role, isActive, escudos, subscriptionStatus, subscriptionPlan, createdAt, updatedAt')
    if (createErr) {
      return NextResponse.json({ error: 'Falha ao criar usuário' }, { status: 500 })
    }
    const createdUser = createdRows?.[0]

    // Criar registro na tabela Instructor
    try {
      await supabaseAdmin
        .from('Instructor')
        .insert({
          name: createdUser.name || 'Instrutor',
          email: createdUser.email,
          bio: 'Instrutor do CyberTeam',
          avatar: null,
          expertise: JSON.stringify(['Cibersegurança']),
          socialLinks: JSON.stringify({}),
          isActive: true,
        })
    } catch (e) {
      // Não bloquear a criação do usuário se falhar a sincronização de instrutor
      console.error('Erro ao criar registro de instrutor:', e)
    }

    return NextResponse.json({ success: true, user: createdUser }, { status: 201 })
  } catch (error) {
    console.error('Error creating instructor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
