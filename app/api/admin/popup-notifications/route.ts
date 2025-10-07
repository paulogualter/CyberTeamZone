import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
// Updated: Migrated from Prisma to Supabase

// GET - Listar notificações popup
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: user, error: userErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
    if (userErr) throw userErr

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    let query = supabaseAdmin
      .from('PopupNotification')
      .select('id, title, message, imageUrl, type, status, timer, startDate, endDate, targetRoles, createdBy, createdAt, updatedAt')
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: notifications, error: notificationsErr } = await query
    if (notificationsErr) throw notificationsErr

    // Buscar dados dos criadores
    const creatorIds = Array.from(new Set((notifications || []).map(n => n.createdBy).filter(Boolean)))
    const { data: creators } = await supabaseAdmin
      .from('User')
      .select('id, name, email')
      .in('id', creatorIds)

    const creatorMap = new Map((creators || []).map(c => [c.id, c]))

    const notificationsWithCreators = (notifications || []).map(notification => ({
      ...notification,
      creator: creatorMap.get(notification.createdBy) || null
    }))

    // Contar total
    let countQuery = supabaseAdmin
      .from('PopupNotification')
      .select('id', { count: 'exact', head: true })
    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }
    const { count: total } = await countQuery

    return NextResponse.json({
      success: true,
      notifications: notificationsWithCreators,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching popup notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar notificação popup
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 POST /api/admin/popup-notifications - Iniciando...')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session:', session ? 'Found' : 'Not found')
    console.log('👤 User ID:', session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: user, error: userErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
    if (userErr) throw userErr
    console.log('👤 User found:', user)
    console.log('🎭 User role:', user?.role)

    if (user?.role !== 'ADMIN') {
      console.log('❌ Forbidden: User is not an admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    console.log('📝 Request body:', body)
    
    const { 
      title, 
      message, 
      imageUrl, 
      type, 
      status, 
      timer, 
      startDate, 
      endDate, 
      targetRoles 
    } = body

    console.log('📋 Parsed data:', {
      title,
      message,
      imageUrl,
      type,
      status,
      timer,
      startDate,
      endDate,
      targetRoles
    })

    if (!title) {
      console.log('❌ Validation error: Title is required')
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Creating notification...')
    
    const { data: notification, error: createErr } = await supabaseAdmin
      .from('PopupNotification')
      .insert({
        title: title.trim(),
        message: message?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        type: (type || 'POPUP'),
        status: (status || 'ACTIVE'),
        timer: timer ? parseInt(timer) : null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        targetRoles: targetRoles ? JSON.stringify(targetRoles) : null,
        createdBy: session.user.id
      })
      .select('id, title, message, imageUrl, type, status, timer, startDate, endDate, targetRoles, createdBy, createdAt, updatedAt')
      .single()
    if (createErr) throw createErr

    // Buscar dados do criador
    const { data: creator } = await supabaseAdmin
      .from('User')
      .select('id, name, email')
      .eq('id', session.user.id)
      .maybeSingle()

    const notificationWithCreator = {
      ...notification,
      creator: creator || null
    }

    console.log('✅ Notification created successfully:', notificationWithCreator)

    return NextResponse.json({
      success: true,
      notification: notificationWithCreator
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating popup notification:', error)
    console.error('❌ Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

// PUT - Atualizar notificação popup
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: user, error: userErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
    if (userErr) throw userErr

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { 
      id,
      title, 
      message, 
      imageUrl, 
      type, 
      status, 
      timer, 
      startDate, 
      endDate, 
      targetRoles 
    } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title) updateData.title = title.trim()
    if (message !== undefined) updateData.message = message?.trim() || null
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null
    if (type) updateData.type = type
    if (status) updateData.status = status
    if (timer !== undefined) updateData.timer = timer ? parseInt(timer) : null
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate).toISOString() : null
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate).toISOString() : null
    if (targetRoles !== undefined) updateData.targetRoles = targetRoles ? JSON.stringify(targetRoles) : null

    const { data: notification, error: updateErr } = await supabaseAdmin
      .from('PopupNotification')
      .update(updateData)
      .eq('id', id)
      .select('id, title, message, imageUrl, type, status, timer, startDate, endDate, targetRoles, createdBy, createdAt, updatedAt')
      .single()
    if (updateErr) throw updateErr

    // Buscar dados do criador
    const { data: creator } = await supabaseAdmin
      .from('User')
      .select('id, name, email')
      .eq('id', notification.createdBy)
      .maybeSingle()

    const notificationWithCreator = {
      ...notification,
      creator: creator || null
    }

    return NextResponse.json({
      success: true,
      notification: notificationWithCreator
    })
  } catch (error) {
    console.error('Error updating popup notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar notificação popup
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: user, error: userErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
    if (userErr) throw userErr

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const { error: deleteErr } = await supabaseAdmin
      .from('PopupNotification')
      .delete()
      .eq('id', id)
    if (deleteErr) throw deleteErr

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting popup notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}