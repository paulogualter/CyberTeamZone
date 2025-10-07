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
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: course, error } = await supabaseAdmin
      .from('Course')
      .select(`
        *,
        instructor:Instructor(id,name,email),
        modules:Module(id,title,description,order,lessons:Lesson(id,title,type,order,videoUrl,attachment,content))
      `)
      .eq('id', params.id)
      .single()

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
    console.error('Error fetching course content:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
// Removed legacy Prisma implementation
