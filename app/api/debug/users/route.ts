import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('User')
      .select('id, name, email, role, subscriptionStatus, createdAt')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: users?.length || 0,
      users: users || []
    })
  } catch (error) {
    console.error('Error in debug users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
