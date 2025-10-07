import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// Função para gerar senha aleatória de 12 caracteres
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export async function GET() {
  try {
    console.log('Fetching instructors from Supabase...')
    
    // Buscar TODOS os instrutores cadastrados (ativos e inativos)
    const { data: instructors, error } = await supabaseAdmin
      .from('Instructor')
      .select(`
        id,
        name,
        email,
        bio,
        avatar,
        expertise,
        socialLinks,
        isActive,
        createdAt,
        updatedAt
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Também incluir usuários com role INSTRUCTOR que ainda não possuem registro em Instructor
    const { data: instructorUsers, error: usersError } = await supabaseAdmin
      .from('User')
      .select('id, name, email, image, isActive')
      .eq('role', 'INSTRUCTOR')

    if (usersError) {
      console.error('Supabase user fetch error:', usersError)
      throw usersError
    }

    const existingEmails = new Set((instructors || []).map((i: any) => (i.email || '').toLowerCase()))
    const synthesizedFromUsers = (instructorUsers || [])
      .filter((u: any) => u.email && !existingEmails.has(u.email.toLowerCase()))
      .map((u: any) => ({
        // Campos mínimos para aparecer no grid
        id: `user_${u.id}`,
        name: u.name || 'Instrutor',
        email: u.email,
        bio: null,
        avatar: u.image || null,
        expertise: null,
        socialLinks: null,
        isActive: u.isActive ?? true,
        createdAt: null,
        updatedAt: null,
      }))

    const combined = [ ...(instructors || []), ...synthesizedFromUsers ]

    console.log('Instructors found (combined):', combined.length)
    return NextResponse.json({
      success: true,
      instructors: combined
    })
  } catch (error) {
    console.error('Error fetching instructors:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, bio, avatar, expertise, socialLinks } = await req.json()

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if instructor already exists
    const { data: existingInstructor } = await supabaseAdmin
      .from('Instructor')
      .select('id')
      .eq('email', email)
      .single()

    if (existingInstructor) {
      return NextResponse.json(
        { error: 'Instructor with this email already exists' },
        { status: 409 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Generate random password
    const randomPassword = generateRandomPassword(12)
    const hashedPassword = await bcrypt.hash(randomPassword, 12)

    // Create instructor
    const { data: instructor, error: instructorError } = await supabaseAdmin
      .from('Instructor')
      .insert({
        name,
        email,
        bio,
        avatar,
        expertise: expertise ? JSON.stringify(expertise) : null,
        socialLinks: socialLinks ? JSON.stringify(socialLinks) : null,
        isActive: true
      })
      .select()
      .single()

    if (instructorError) {
      console.error('Error creating instructor:', instructorError)
      throw instructorError
    }

    // Create user account for instructor
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .insert({
        name,
        email,
        password: hashedPassword,
        role: 'INSTRUCTOR',
        isActive: true,
        escudos: 0,
        subscriptionStatus: 'ACTIVE', // Instrutores têm acesso total
        subscriptionPlan: null // Instrutores não precisam de plano
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      throw userError
    }

    return NextResponse.json({
      success: true,
      instructor,
      user,
      generatedPassword: randomPassword,
      message: 'Instrutor criado com sucesso! Senha gerada automaticamente.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating instructor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
