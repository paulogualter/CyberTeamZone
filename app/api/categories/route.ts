import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('Category')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Fetch public courses to compute counts (ACTIVE + isPublished + APPROVED)
    const { data: courses, error: coursesErr } = await supabaseAdmin
      .from('Course')
      .select('id, categoryId, status, isPublished, approvalStatus')
      .eq('status', 'ACTIVE')
      .eq('isPublished', true)
      .eq('approvalStatus', 'APPROVED')

    if (coursesErr) {
      console.error('Supabase error (courses for category counts):', coursesErr)
    }

    const categoryIdToCount: Record<string, number> = {}
    ;(courses || []).forEach((c: any) => {
      if (!c.categoryId) return
      categoryIdToCount[c.categoryId] = (categoryIdToCount[c.categoryId] || 0) + 1
    })

    // Transform the data to include courseCount
    const categoriesWithCount = (categories || []).map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      courseCount: categoryIdToCount[category.id] || 0
    }))

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
