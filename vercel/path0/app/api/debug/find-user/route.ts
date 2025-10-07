import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter is required'
      }, { status: 400 })
    }
    
    console.log('🔍 Debug: Searching for user with email:', email)
    
    const { data: user, error } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'User not found',
          email: email
        }, { status: 404 })
      }
      console.error('❌ Error searching for user:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to search for user',
        details: error
      }, { status: 500 })
    }

    console.log('✅ User found:', user)
    return NextResponse.json({
      success: true,
      user: user
    })
  } catch (error) {
    console.error('Error in debug find user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
