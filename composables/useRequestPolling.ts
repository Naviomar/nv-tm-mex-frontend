interface PollOptions {
  processName: string
  requestKey: string
  onStatusChange?: (fresh: any[], prev: any[]) => void
  intervalMs?: number
}

/**
 * Polls the status of a process request at a fixed interval.
 * Automatically stops when no pending requests remain or when the component unmounts.
 * Emits onStatusChange whenever the request list changes (e.g. pending → granted).
 */
export function useRequestPolling(options: PollOptions) {
  const { $api } = useNuxtApp()

  const requests = ref<any[]>([])
  const isPolling = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const hasPending = computed(() => requests.value.some((r: any) => r.status === 'pending'))
  const hasGranted = computed(() => requests.value.some((r: any) => r.status === 'granted' && r.is_granted))

  async function fetchOnce(): Promise<any[]> {
    const fresh = (await ($api as any).authProcessRequests.getRequestsByResource({
      process_name: options.processName,
      request_key: options.requestKey,
    })) as any[]

    const prev = [...requests.value]
    requests.value = fresh

    if (options.onStatusChange) {
      const prevStatuses = prev.map((r: any) => `${r.id}:${r.status}`)
      const freshStatuses = fresh.map((r: any) => `${r.id}:${r.status}`)
      const changed = JSON.stringify(prevStatuses) !== JSON.stringify(freshStatuses)
      if (changed) {
        options.onStatusChange(fresh, prev)
      }
    }

    return fresh
  }

  function startPolling() {
    if (isPolling.value) return
    isPolling.value = true
    timer = setInterval(async () => {
      await fetchOnce()
      if (!hasPending.value) {
        stopPolling()
      }
    }, options.intervalMs ?? 8000)
  }

  function stopPolling() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isPolling.value = false
  }

  onUnmounted(stopPolling)

  return { requests, hasPending, hasGranted, isPolling, fetchOnce, startPolling, stopPolling }
}
