export function useAlertsSocket() {
  const alertsStore = useAlertsStore()
  const { user } = useSanctumAuth()

  let channel: any = null

  const getUserId = (): number | null => {
    const userData = user.value as any
    return userData?.id ?? null
  }

  const connect = () => {
    const userId = getUserId()
    if (!userId || !import.meta.client) return

    try {
      const echo = useNuxtApp().$echo
      if (!echo) {
        console.warn('Echo not available')
        return
      }

      channel = echo.private(`alerts.user.${userId}`)
      
      channel.listen('.alert.created', (event: any) => {
        if (event.alert) {
          alertsStore.addAlert({
            id: event.alert.id,
            alert_user_id: event.alert.id,
            title: event.alert.title,
            message: event.alert.message,
            severity: event.alert.severity,
            icon: event.alert.icon,
            color: event.alert.color,
            category: event.alert.category,
            action_url: event.alert.action_url,
            data: event.alert.data,
            read_at: null,
            created_at: event.alert.created_at,
          })
        }
      })

      console.log('Alerts socket connected for user:', userId)
    } catch (error) {
      console.error('Error connecting to alerts socket:', error)
    }
  }

  const disconnect = () => {
    const userId = getUserId()
    if (channel && userId) {
      try {
        const echo = useNuxtApp().$echo
        if (echo) {
          echo.leave(`alerts.user.${userId}`)
        }
        channel = null
        console.log('Alerts socket disconnected')
      } catch (error) {
        console.error('Error disconnecting alerts socket:', error)
      }
    }
  }

  return {
    connect,
    disconnect,
  }
}
