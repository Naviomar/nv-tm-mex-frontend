import { defineStore } from 'pinia'
import type { LiveChat, PendingRequest } from '~/repository/modules/catalogs/ticketMessages'

const POLL_MS = 60_000

/**
 * What needs the user's attention in the header drawer: chats of open
 * requests with unread messages, and new requests still waiting for a decision
 * that the user can attend.
 */
export const useRequestInboxStore = defineStore('requestInbox', {
  state: () => ({
    unreadChats: [] as LiveChat[],
    pendingRequests: [] as PendingRequest[],
    isLoading: false,
    lastLoadedAt: 0,
    timer: null as ReturnType<typeof setInterval> | null,
  }),

  getters: {
    unreadMessages: (state) => state.unreadChats.reduce((sum, c) => sum + c.unread_count, 0),
    total(): number {
      return this.unreadChats.length + this.pendingRequests.length
    },
  },

  actions: {
    async refresh() {
      const api = useApiFactory()
      this.isLoading = true
      try {
        const [chats, pending] = await Promise.all([
          api.ticketMessages.getLiveChats({ unread_only: true }),
          api.ticketMessages.getPendingRequests(),
        ])
        this.unreadChats = chats
        this.pendingRequests = pending
        this.lastLoadedAt = Date.now()
      } catch (error) {
        console.error('Error fetching request inbox:', error)
      } finally {
        this.isLoading = false
      }
    },

    /** Drop a chat locally as soon as the user opens it (the backend marks it read on fetch). */
    markChatRead(type: string, id: number) {
      this.unreadChats = this.unreadChats.filter((c) => !(c.ticket_type === type && c.ticket_id === id))
    },

    startPolling() {
      if (this.timer || !import.meta.client) return
      this.refresh()
      this.timer = setInterval(() => this.refresh(), POLL_MS)
    },

    stopPolling() {
      if (this.timer) clearInterval(this.timer)
      this.timer = null
    },
  },
})
