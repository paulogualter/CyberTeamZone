'use client'

import { usePopupNotifications } from '@/hooks/usePopupNotifications'
import PopupNotificationComponent from './PopupNotification'

export default function NotificationProvider() {
  const { currentNotification, closeCurrentNotification, markAsShown } = usePopupNotifications()

  if (!currentNotification) {
    return null
  }

  return (
    <PopupNotificationComponent
      notification={currentNotification}
      onClose={closeCurrentNotification}
      onMarkAsShown={markAsShown}
    />
  )
}
