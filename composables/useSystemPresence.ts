import type { IOnlineUser } from '~/repository/modules/systemLogs'

interface PresenceState {
  users: IOnlineUser[]
  isConnected: boolean
}

// Global state shared across all instances
const globalState = reactive<PresenceState>({
  users: [],
  isConnected: false,
})

let presenceChannel: any = null

export function useSystemPresence() {
  const connect = () => {
    if (!import.meta.client || globalState.isConnected) return

    try {
      const echo = useNuxtApp().$echo
      if (!echo) {
        console.warn('[SystemPresence] Echo not available')
        return
      }

      presenceChannel = echo.join('presence-system')
        .here((users: IOnlineUser[]) => {
          globalState.users = users
          console.log(`[SystemPresence] ${users.length} users online`)
        })
        .joining((user: IOnlineUser) => {
          const exists = globalState.users.find((u) => u.id === user.id)
          if (!exists) {
            globalState.users.push(user)
          }
          console.log(`[SystemPresence] User joined: ${user.name}`)
        })
        .leaving((user: IOnlineUser) => {
          globalState.users = globalState.users.filter((u) => u.id !== user.id)
          console.log(`[SystemPresence] User left: ${user.name}`)
        })

      globalState.isConnected = true
      console.log('[SystemPresence] Connected to presence channel')
    } catch (e) {
      console.error('[SystemPresence] Failed to connect:', e)
    }
  }

  const disconnect = () => {
    try {
      const echo = useNuxtApp().$echo
      if (echo && presenceChannel) {
        echo.leave('presence-system')
        presenceChannel = null
      }
      globalState.isConnected = false
      globalState.users = []
      console.log('[SystemPresence] Disconnected from presence channel')
    } catch (e) {
      console.error('[SystemPresence] Failed to disconnect:', e)
    }
  }

  return {
    users: computed(() => globalState.users),
    isConnected: computed(() => globalState.isConnected),
    connect,
    disconnect,
  }
}
