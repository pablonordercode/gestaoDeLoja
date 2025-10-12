import { useState, useCallback } from 'react'

export const useNotification = () => {
  const [notifications, setNotifications] = useState([])

  const showNotification = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    const notification = { id, message, type, duration }
    
    setNotifications(prev => [...prev, notification])
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showSuccess = useCallback((message) => {
    showNotification(message, 'success')
  }, [showNotification])

  const showError = useCallback((message) => {
    showNotification(message, 'error')
  }, [showNotification])

  const showWarning = useCallback((message) => {
    showNotification(message, 'warning')
  }, [showNotification])

  const showInfo = useCallback((message) => {
    showNotification(message, 'info')
  }, [showNotification])

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification
  }
}
