import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🔍 Debug: Testing Supabase connection...')
    
    // Test basic connection
    const { data: plans, error } = await supabaseAdmin
      .from('Subscription')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    console.log('✅ Plans found:', plans?.length || 0)
    console.log('📋 Plans data:', plans)

    return NextResponse.json({
      success: true,
      count: plans?.length || 0,
      plans: plans || [],
      message: `Found ${plans?.length || 0} subscription plans`
    })
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
