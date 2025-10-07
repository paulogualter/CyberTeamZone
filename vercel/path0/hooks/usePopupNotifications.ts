'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface PopupNotification {
  id: string
  title: string
  message?: string
  imageUrl?: string
  type: string
  timer?: number
}

export function usePopupNotifications() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<PopupNotification[]>([])
  const [currentNotification, setCurrentNotification] = useState<PopupNotification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      setLoading(false)
      return
    }

    fetchNotifications()
  }, [session, status])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications/active')
      const data = await response.json()

      if (data.success && data.notifications.length > 0) {
        setNotifications(data.notifications)
        // Mostrar a primeira notificação
        setCurrentNotification(data.notifications[0])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsShown = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/mark-shown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId })
      })
    } catch (error) {
      console.error('Error marking notification as shown:', error)
    }
  }

  const closeCurrentNotification = () => {
    setCurrentNotification(null)
    
    // Se há mais notificações, mostrar a próxima
    if (notifications.length > 1) {
      const remainingNotifications = notifications.slice(1)
      setNotifications(remainingNotifications)
      setCurrentNotification(remainingNotifications[0])
    } else {
      setNotifications([])
    }
  }

  const closeAllNotifications = () => {
    setCurrentNotification(null)
    setNotifications([])
  }

  return {
    currentNotification,
    hasNotifications: notifications.length > 0,
    loading,
    closeCurrentNotification,
    closeAllNotifications,
    markAsShown
  }
}
