import { ref, computed, onUnmounted } from 'vue'
import type { TicketType, TicketMessage } from '~/repository/modules/catalogs/ticketMessages'
import type { TicketMessageFile } from '~/repository/modules/catalogs/ticketMessages'

export function useTicketChat(ticketType: TicketType, ticketId: number) {
  const { $api } = useNuxtApp()
  const { $echo } = useNuxtApp() as any

  const messages = ref<TicketMessage[]>([])
  const isLoading = ref(false)
  const isSending = ref(false)
  const unreadCount = ref(0)
  const channelName = `ticket.${ticketType}.${ticketId}`

  // ── API calls ────────────────────────────────────────────────────────────

  async function fetchMessages() {
    isLoading.value = true
    try {
      messages.value = await $api.ticketMessages.getMessages(ticketType, ticketId)
      unreadCount.value = 0
    } catch (e) {
      console.error('[useTicketChat] fetchMessages error', e)
    } finally {
      isLoading.value = false
    }
  }

  async function sendMessage(body: string, isInternal = false, files: File[] = []) {
    const hasBody = body.trim().length > 0
    const hasFiles = files.length > 0
    if (!hasBody && !hasFiles) return
    isSending.value = true
    try {
      const msg: TicketMessage = await $api.ticketMessages.sendMessage(ticketType, ticketId, {
        body: hasBody ? body.trim() : undefined,
        is_internal: isInternal,
        files: hasFiles ? files : undefined,
      })
      // WS may have already pushed this message (race: broadcast fires before HTTP response)
      const alreadyInList = messages.value.some((m) => m.id === msg.id)
      if (!alreadyInList) messages.value.push(msg)
    } catch (e) {
      console.error('[useTicketChat] sendMessage error', e)
      throw e
    } finally {
      isSending.value = false
    }
  }

  async function markRead() {
    try {
      await $api.ticketMessages.markRead(ticketType, ticketId)
      messages.value.forEach((m) => {
        if (!m.read_at) m.read_at = new Date().toISOString()
      })
      unreadCount.value = 0
    } catch (e) {
      console.error('[useTicketChat] markRead error', e)
    }
  }

  async function editMessage(messageId: number, newBody: string) {
    try {
      const updated: TicketMessage = await $api.ticketMessages.editMessage(messageId, newBody)
      const idx = messages.value.findIndex((m) => m.id === messageId)
      if (idx !== -1) messages.value[idx] = updated
    } catch (e) {
      console.error('[useTicketChat] editMessage error', e)
      throw e
    }
  }

  async function deleteMessage(messageId: number) {
    try {
      await $api.ticketMessages.deleteMessage(messageId)
      messages.value = messages.value.filter((m) => m.id !== messageId)
    } catch (e) {
      console.error('[useTicketChat] deleteMessage error', e)
      throw e
    }
  }

  async function fetchUnreadCount() {
    try {
      const res = await $api.ticketMessages.getUnreadCount(ticketType, ticketId)
      unreadCount.value = res?.unread_count ?? 0
    } catch (_) {
      unreadCount.value = 0
    }
  }

  // ── WebSocket ────────────────────────────────────────────────────────────

  function connectChannel() {
    if (!$echo) return
    $echo
      .private(channelName)
      .listen('.message.sent', (data: TicketMessage) => {
        const exists = messages.value.some((m) => m.id === data.id)
        if (!exists) {
          messages.value.push(data)
          unreadCount.value += 1
        }
      })
  }

  function disconnectChannel() {
    if (!$echo) return
    $echo.leave(channelName)
  }

  onUnmounted(disconnectChannel)

  // ── Helpers ──────────────────────────────────────────────────────────────

  const hasUnread = computed(() => unreadCount.value > 0)

  return {
    messages,
    isLoading,
    isSending,
    unreadCount,
    hasUnread,
    fetchMessages,
    sendMessage,
    editMessage,
    markRead,
    deleteMessage,
    fetchUnreadCount,
    connectChannel,
    disconnectChannel,
  }
}
