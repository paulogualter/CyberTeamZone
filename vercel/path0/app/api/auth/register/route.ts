import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()
    const normalizedEmail = (email || '').trim().toLowerCase()

    // Basic validation
    if (!name || !normalizedEmail || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { message: 'This email is already in use' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário
    const now = new Date().toISOString()
    const { data: user, error } = await supabaseAdmin
      .from('User')
      .insert({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'STUDENT',
        escudos: 0,
        subscriptionStatus: 'INACTIVE',
        subscriptionPlan: null,
        emailVerified: now,
        image: null,
        isActive: true,
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Remover a senha da resposta
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { message: 'Internal server error', details: process.env.NODE_ENV !== 'production' ? message : undefined },
      { status: 500 }
    )
  }
}
