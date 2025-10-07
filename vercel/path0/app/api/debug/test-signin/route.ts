import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const { email, name, image } = await request.json()
    console.log('🔍 Debug: Testing signIn callback logic')
    console.log('👤 User data:', { email, name })
    
    // Simular o callback signIn
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    console.log('🔍 Debug: Existing user check:', { existingUser, fetchError })

    if (!existingUser) {
      console.log('➕ Creating new user in Supabase...')
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
    } else {
      console.log('🔄 Updating existing user...')
      const { error: updateError } = await supabaseAdmin
        .from('User')
        .update({
          name: name,
          image: image,
        })
        .eq('email', email)

      if (updateError) {
        console.error('❌ Error updating user:', updateError)
        return NextResponse.json({
          success: false,
          error: 'Failed to update user',
          details: updateError
        })
      }
      console.log('✅ User updated successfully')
      return NextResponse.json({
        success: true,
        message: 'User updated successfully'
      })
    }
  } catch (error) {
    console.error('❌ Debug test signin error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug test signin failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
