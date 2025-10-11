import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const instructor = searchParams.get('instructor')

    const skip = (page - 1) * limit

    // Get user session to check enrollments
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    let userRole: string | null = null
    if (userId) {
      const { data: u } = await supabaseAdmin
        .from('User')
        .select('role')
        .eq('id', userId)
        .single()
      userRole = u?.role || null
    }

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    }
    // Only require published/approved for non-admin/instructor
    const requirePublished = !(userRole === 'ADMIN' || userRole === 'INSTRUCTOR')

    if (category && category !== 'all') {
      where.categoryId = category
    }

    if (search) {
      // Note: Supabase doesn't support OR in where clause like this
      // We'll handle search filtering in the query instead
    }

    if (instructor) {
      where.instructor = {
        name: { contains: instructor, mode: 'insensitive' }
      }
    }

    // Build Supabase filter
    let query = supabaseAdmin
      .from('Course')
      .select('*', { count: 'exact' })
      .eq('status', 'ACTIVE')
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1)

    if (requirePublished) {
      // Catálogo público: apenas cursos publicados, ativos e aprovados
      query = query
        .eq('isPublished', true)
        .eq('status', 'ACTIVE')
        .eq('approvalStatus', 'APPROVED')
    }

    if (where.categoryId) query = query.eq('categoryId', where.categoryId)
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,shortDescription.ilike.%${search}%`)
    // Note: instructor filtering would need to be done differently with Supabase
    // For now, we'll skip instructor filtering in the query

    const { data: courses, error, count } = await query
    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    // Get user enrollments if logged in
    let userEnrollments: any[] = []
    if (userId) {
      const { data: enrollments } = await supabaseAdmin
        .from('Enrollment')
        .select('courseId,progress')
        .eq('userId', userId)
        .eq('isActive', true)
      userEnrollments = enrollments || []
    }

    // Create enrollment map for quick lookup
    const enrollmentMap = new Map()
    userEnrollments.forEach(enrollment => {
      enrollmentMap.set(enrollment.courseId, enrollment.progress)
    })

    // Add enrollment info to courses
    const coursesWithEnrollment = courses.map(course => ({
      ...course,
      isEnrolled: enrollmentMap.has(course.id),
      progress: enrollmentMap.get(course.id) || 0
    }))

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({ 
      courses: coursesWithEnrollment,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
