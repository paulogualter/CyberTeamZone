import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET: retorna progresso agregado do curso para o usuário
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }

    // Buscar todas as aulas do curso
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('Module')
      .select('id, lessons:Lesson(id)')
      .eq('courseId', courseId)
    if (modErr) throw modErr

    const lessonIds = (modules || []).flatMap((m) => (m.lessons || []).map((l: any) => l.id))
    const totalLessons = lessonIds.length

    if (totalLessons === 0) {
      return NextResponse.json({ progress: { percentage: 0, completedLessons: 0, totalLessons: 0, progressMap: {} } })
    }

    // Buscar progresso do usuário (tabela UserLessonProgress)
    const { data: progresses, error: progErr } = await supabaseAdmin
      .from('UserLessonProgress')
      .select('lessonId, completed')
      .eq('userId', session.user.id)
      .in('lessonId', lessonIds)
    if (progErr) throw progErr

    const progressMap: Record<string, { completed: boolean }> = {}
    let completedLessons = 0
    for (const row of progresses || []) {
      progressMap[row.lessonId] = { completed: Boolean(row.completed) }
      if (row.completed) completedLessons += 1
    }

    const percentage = Math.round((completedLessons / totalLessons) * 100)
    return NextResponse.json({ progress: { percentage, completedLessons, totalLessons, progressMap } })
  } catch (e) {
    console.error('Error fetching course progress:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: marca progresso de uma aula
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { lessonId, completed, watchedTime, videoDuration } = await req.json()
    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
    }

    const nowIso = new Date().toISOString()
    const upsertData = {
      userId: session.user.id,
      lessonId,
      completed: Boolean(completed),
      watchedTime: watchedTime ?? null,
      videoDuration: videoDuration ?? null,
      updatedAt: nowIso
    }

    // upsert
    const { error } = await supabaseAdmin
      .from('UserLessonProgress')
      .upsert(upsertData, { onConflict: 'userId,lessonId' })
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Error updating course progress:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

