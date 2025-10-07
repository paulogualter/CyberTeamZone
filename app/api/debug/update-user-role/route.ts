import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json()
    console.log('🔍 Debug: Updating user role:', { userId, role })
    
    const { data: updatedUser, error } = await supabaseAdmin
      .from('User')
      .update({ 
        role: role,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating user:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update user',
        details: error
      }, { status: 500 })
    }

    console.log('✅ User updated successfully:', updatedUser)
    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error in debug update user role:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
