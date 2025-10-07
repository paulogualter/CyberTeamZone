import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Buscar notificações ativas para o usuário
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar usuário para verificar role
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago

    // Buscar notificações ativas
    const { data: notifications, error: notificationsError } = await supabaseAdmin
      .from('PopupNotification')
      .select('*')
      .eq('status', 'ACTIVE')
      .or(`startDate.is.null,startDate.lte.${now.toISOString()}`)
      .or(`endDate.is.null,endDate.gte.${now.toISOString()}`)
      .or(`lastShownAt.is.null,lastShownAt.lt.${fourHoursAgo.toISOString()}`)
      .order('createdAt', { ascending: false })

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    // Filtrar por roles se especificado
    const filteredNotifications = notifications.filter(notification => {
      if (!notification.targetRoles) {
        return true // Se não especificar roles, mostra para todos
      }

      try {
        const targetRoles = JSON.parse(notification.targetRoles)
        return targetRoles.includes(user.role)
      } catch {
        return true // Se erro ao parsear, mostra para todos
      }
    })

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications
    })
  } catch (error) {
    console.error('Error fetching active notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
