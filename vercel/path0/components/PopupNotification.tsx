'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'

interface PopupNotification {
  id: string
  title: string
  message?: string
  imageUrl?: string
  type: string
  timer?: number
}

interface PopupNotificationProps {
  notification: PopupNotification
  onClose: () => void
  onMarkAsShown?: (notificationId: string) => void
}

export default function PopupNotificationComponent({ notification, onClose, onMarkAsShown }: PopupNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(notification.timer || 0)
  const [showCloseButton, setShowCloseButton] = useState(false)

  useEffect(() => {
    // Marcar como exibido quando o componente é montado
    if (onMarkAsShown) {
      onMarkAsShown(notification.id)
    }

    if (notification.timer && notification.timer > 0) {
      setTimeLeft(notification.timer)
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowCloseButton(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } else {
      setShowCloseButton(true)
    }
  }, [notification.timer, notification.id, onMarkAsShown])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold text-center">{notification.title}</h2>
            {notification.timer && notification.timer > 0 && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-3 py-1">
                <ClockIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {notification.imageUrl && (
              <div className="mb-4">
                <img
                  src={notification.imageUrl}
                  alt={notification.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {notification.message && (
              <div className="mb-6">
                <p className="text-gray-700 text-center leading-relaxed">
                  {notification.message}
                </p>
              </div>
            )}

            {/* Close Button */}
            {showCloseButton && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Fechar
              </motion.button>
            )}

            {/* Timer Progress Bar */}
            {notification.timer && notification.timer > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: notification.timer, ease: 'linear' }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
