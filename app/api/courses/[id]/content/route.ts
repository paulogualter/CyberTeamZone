import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role as string | undefined
    const bypassVisibility = role === 'ADMIN' || role === 'INSTRUCTOR'

    let query = supabaseAdmin
      .from('Course')
      .select(`
        *,
        instructor:Instructor(id,name,email),
        modules:Module(id,title,description,order,lessons:Lesson(id,title,type,order,videoUrl,attachment,content))
      `)
      .eq('id', params.id)

    if (!bypassVisibility) {
      query = query.eq('isPublished', true).eq('status', 'ACTIVE').eq('approvalStatus', 'APPROVED')
    }

    const { data: course, error } = await query.single()
    if (error || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const ordered = {
      ...course,
      modules: (course.modules || []).map((m: any) => ({
        ...m,
        lessons: (m.lessons || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    }

    return NextResponse.json({ success: true, course: ordered })
  } catch (e) {
    console.error('Error fetching public course content:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


