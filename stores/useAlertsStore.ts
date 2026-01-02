import { defineStore } from 'pinia'
import type { IAlert } from '~/repository/modules/alerts'

interface AlertsState {
  alerts: IAlert[]
  unreadCount: number
  isLoading: boolean
  isDrawerOpen: boolean
}

export const useAlertsStore = defineStore('alerts', {
  state: (): AlertsState => ({
    alerts: [],
    unreadCount: 0,
    isLoading: false,
    isDrawerOpen: false,
  }),

  getters: {
    hasUnread: (state) => state.unreadCount > 0,
    unreadAlerts: (state) => state.alerts.filter((a) => !a.read_at),
  },

  actions: {
    async fetchAlerts() {
      const api = useApiFactory()
      this.isLoading = true
      try {
        const response = await api.alerts.getAlerts(50)
        this.alerts = response.data
        this.unreadCount = response.unread_count
      } catch (error) {
        console.error('Error fetching alerts:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchUnreadCount() {
      const api = useApiFactory()
      try {
        const response: any = await api.alerts.getUnreadCount()
        this.unreadCount = response.count
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    },

    async markAsRead(alertUserId: number) {
      const api = useApiFactory()
      try {
        await api.alerts.markAsRead(alertUserId)
        const alert = this.alerts.find((a) => a.alert_user_id === alertUserId)
        if (alert) {
          alert.read_at = new Date().toISOString()
        }
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      } catch (error) {
        console.error('Error marking alert as read:', error)
      }
    },

    async markAllAsRead() {
      const api = useApiFactory()
      try {
        await api.alerts.markAllAsRead()
        this.alerts.forEach((a) => {
          if (!a.read_at) {
            a.read_at = new Date().toISOString()
          }
        })
        this.unreadCount = 0
      } catch (error) {
        console.error('Error marking all alerts as read:', error)
      }
    },

    async dismissAlert(alertUserId: number) {
      const api = useApiFactory()
      try {
        await api.alerts.dismiss(alertUserId)
        this.alerts = this.alerts.filter((a) => a.alert_user_id !== alertUserId)
        await this.fetchUnreadCount()
      } catch (error) {
        console.error('Error dismissing alert:', error)
      }
    },

    async dismissAll() {
      const api = useApiFactory()
      try {
        await api.alerts.dismissAll()
        this.alerts = []
        this.unreadCount = 0
      } catch (error) {
        console.error('Error dismissing all alerts:', error)
      }
    },

    addAlert(alert: IAlert) {
      this.alerts.unshift(alert)
      this.unreadCount++
    },

    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen
    },

    openDrawer() {
      this.isDrawerOpen = true
    },

    closeDrawer() {
      this.isDrawerOpen = false
    },
  },
})
