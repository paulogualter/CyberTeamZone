import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const { email, name, image } = await request.json()
    console.log('🔍 Debug: Creating test user:', { email, name })
    
    const now = new Date().toISOString()
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('User')
      .insert({
        id: userId,
        email: email,
        name: name,
        image: image,
        role: 'STUDENT',
        escudos: 0,
        subscriptionStatus: 'INACTIVE',
        emailVerified: now,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error creating user:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        details: insertError
      })
    }

    console.log('✅ User created successfully:', newUser)
    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('❌ Debug create user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug create user failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
