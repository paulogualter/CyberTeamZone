import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PopupType, NotificationStatus } from '@prisma/client'

// GET - Listar notificações popup
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const notifications = await prisma.popupNotification.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const total = await prisma.popupNotification.count({ where })

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
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
    
    const notification = await prisma.popupNotification.create({
      data: {
        title: title.trim(),
        message: message?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        type: (type || 'POPUP') as PopupType,
        status: (status || 'ACTIVE') as NotificationStatus,
        timer: timer ? parseInt(timer) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        targetRoles: targetRoles ? JSON.stringify(targetRoles) : null,
        createdBy: session.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('✅ Notification created successfully:', notification)

    return NextResponse.json({
      success: true,
      notification
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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

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

    const notification = await prisma.popupNotification.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(message !== undefined && { message: message?.trim() || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
        ...(type && { type: type as PopupType }),
        ...(status && { status: status as NotificationStatus }),
        ...(timer !== undefined && { timer: timer ? parseInt(timer) : null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(targetRoles !== undefined && { targetRoles: targetRoles ? JSON.stringify(targetRoles) : null })
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      notification
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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

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

    await prisma.popupNotification.delete({
      where: { id }
    })

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
