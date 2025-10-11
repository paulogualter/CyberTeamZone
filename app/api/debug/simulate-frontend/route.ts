import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Frontend simulation endpoint called')
    
    // Simulate the exact request the frontend would send
    const requestBody = await req.json()
    console.log('📝 Frontend request body:', JSON.stringify(requestBody, null, 2))
    
    // Extract all possible fields
    const { 
      title, 
      description, 
      content, 
      videoUrl, 
      duration, 
      order, 
      moduleId,
      isPublished = false 
    } = requestBody

    console.log('📊 Extracted fields:', {
      title: !!title,
      description: !!description,
      content: !!content,
      videoUrl: !!videoUrl,
      duration: duration,
      order: order,
      moduleId: !!moduleId,
      isPublished: isPublished
    })

    // Check session
    const session = await getServerSession(authOptions)
    console.log('📋 Session:', {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: (session?.user as any)?.role
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role
    const userRole = (session.user as any)?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate required fields
    if (!title || !moduleId) {
      return NextResponse.json(
        { error: 'Title and moduleId are required' },
        { status: 400 }
      )
    }

    // Check module exists
    const { data: module, error: moduleErr } = await supabaseAdmin
      .from('Module')
      .select('id, courseId')
      .eq('id', moduleId)
      .single()

    if (moduleErr || !module) {
      console.log('❌ Module error:', moduleErr)
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    // Check course exists
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('Course')
      .select('id, instructorId')
      .eq('id', module.courseId)
      .single()

    if (courseErr || !course) {
      console.log('❌ Course error:', courseErr)
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get next order
    let lessonOrder = order as number | undefined
    if (!lessonOrder) {
      const { data: last, error: lastErr } = await supabaseAdmin
        .from('Lesson')
        .select('order')
        .eq('moduleId', moduleId)
        .order('order', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (lastErr) {
        console.warn('Could not get last lesson order:', lastErr)
      }
      lessonOrder = last?.order ? (Number(last.order) + 1) : 1
    }

    const nowIso = new Date().toISOString()
    const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    console.log('🔗 Creating lesson with:', {
      id: lessonId,
      title,
      moduleId,
      order: lessonOrder,
      isPublished
    })

    // Create lesson
    const { data: created, error: createErr } = await supabaseAdmin
      .from('Lesson')
      .insert({
        id: lessonId,
        title,
        description: description || '',
        content: content || '',
        videoUrl: videoUrl || '',
        duration: duration || 0,
        moduleId,
        order: lessonOrder,
        isPublished,
        createdAt: nowIso,
        updatedAt: nowIso
      })
      .select('*')
      .single()

    if (createErr) {
      console.error('❌ Create error:', createErr)
      return NextResponse.json({ 
        error: 'Failed to create lesson',
        debug: { supabaseError: createErr.message }
      }, { status: 500 })
    }

    console.log('✅ Lesson created:', created?.id)
    return NextResponse.json({
      success: true,
      lesson: created
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Simulation error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      debug: {
        error: error.message,
        stack: error.stack
      }
    }, { status: 500 })
  }
}
