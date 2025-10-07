import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    // Basic connectivity check - just test a simple query
    const { data: testData, error: testError } = await supabaseAdmin
      .from('User')
      .select('id')
      .limit(1)

    if (testError) {
      throw testError
    }

    // Counts
    const [usersResult, categoriesResult, coursesResult] = await Promise.all([
      supabaseAdmin.from('User').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('Category').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('Course').select('*', { count: 'exact', head: true }),
    ])

    if (usersResult.error) throw usersResult.error
    if (categoriesResult.error) throw categoriesResult.error
    if (coursesResult.error) throw coursesResult.error

    // Optional specific email check
    const { searchParams } = new URL(req.url)
    const emailParam = searchParams.get('email')
    let userByEmail: { id: string; email: string } | null = null
    if (emailParam) {
      const email = emailParam.trim().toLowerCase()
      const { data: u, error: userError } = await supabaseAdmin
        .from('User')
        .select('id, email')
        .eq('email', email)
        .single()
      
      if (!userError && u) userByEmail = u
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      counts: { 
        users: usersResult.count || 0, 
        categories: categoriesResult.count || 0, 
        courses: coursesResult.count || 0 
      },
      userByEmail,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: 'DB check failed',
        message: error?.message,
      },
      { status: 500 }
    )
  }
}


