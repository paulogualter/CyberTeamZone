import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar notificações ativas para o usuário
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar usuário para verificar role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago

    // Buscar notificações ativas
    const notifications = await prisma.popupNotification.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          },
          // Verificar se não foi exibido nas últimas 4 horas
          {
            OR: [
              { lastShownAt: null }, // Nunca foi exibido
              { lastShownAt: { lt: fourHoursAgo } } // Foi exibido há mais de 4 horas
            ]
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

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
