import type { ISystemLog, ISystemLogMetrics, IOnlineUser } from '~/repository/modules/systemLogs'

interface SystemLogsState {
  logs: ISystemLog[]
  metrics: ISystemLogMetrics | null
  isStreamActive: boolean
  isLoading: boolean
  pagination: {
    currentPage: number
    lastPage: number
    total: number
    perPage: number
  }
  filters: Record<string, string>
}

export function useSystemLogs() {
  const api = useApiFactory()
  const { user } = useSanctumAuth()

  const state = reactive<SystemLogsState>({
    logs: [],
    metrics: null,
    isStreamActive: false,
    isLoading: false,
    pagination: {
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 25,
    },
    filters: {},
  })

  let logsChannel: any = null

  // ---- API calls ----

  const fetchLogs = async (page = 1) => {
    state.isLoading = true
    try {
      const params: Record<string, string> = {
        ...state.filters,
        page: String(page),
        per_page: String(state.pagination.perPage),
      }
      // Remove empty filter values
      Object.keys(params).forEach((k) => {
        if (!params[k]) delete params[k]
      })

      const res = await api.systemLogs.index(params)
      state.logs = res.data ?? []
      state.pagination = {
        currentPage: res.current_page ?? 1,
        lastPage: res.last_page ?? 1,
        total: res.total ?? 0,
        perPage: res.per_page ?? 25,
      }
    } catch (e) {
      console.error('[SystemLogs] Failed to fetch logs:', e)
    } finally {
      state.isLoading = false
    }
  }

  const fetchMetrics = async () => {
    try {
      const res = await api.systemLogs.metrics()
      state.metrics = res.data ?? null
    } catch (e) {
      console.error('[SystemLogs] Failed to fetch metrics:', e)
    }
  }

  // Increment metrics in real-time when new log arrives
  const updateMetricsForNewLog = (log: ISystemLog) => {
    if (!state.metrics) return
    
    // Increment total counters
    state.metrics.total_today += 1
    state.metrics.total_last_hour += 1
    
    // Increment by level
    if (log.level === 'error') state.metrics.errors_today += 1
    if (log.level === 'critical') state.metrics.critical_today += 1
    if (log.level === 'warning') state.metrics.warnings_today += 1
    
    // Increment by type
    if (log.type === 'job_failed') state.metrics.jobs_failed_today += 1
    if (log.type === 'http_error') state.metrics.http_errors_today += 1
    
    // Update by_type_today
    if (!state.metrics.by_type_today[log.type]) {
      state.metrics.by_type_today[log.type] = 0
    }
    state.metrics.by_type_today[log.type] += 1
    
    // Update by_level_today
    if (!state.metrics.by_level_today[log.level]) {
      state.metrics.by_level_today[log.level] = 0
    }
    state.metrics.by_level_today[log.level] += 1
  }

  const fetchLogDetail = async (id: number) => {
    try {
      const res = await api.systemLogs.show(id)
      return res.data ?? null
    } catch (e) {
      console.error('[SystemLogs] Failed to fetch log detail:', e)
      return null
    }
  }

  // ---- Filters ----

  const setFilters = (filters: Record<string, string>) => {
    state.filters = { ...filters }
    fetchLogs(1)
  }

  const clearFilters = () => {
    state.filters = {}
    fetchLogs(1)
  }

  // ---- Real-time (Echo + Reverb) ----

  const connectStream = () => {
    if (!import.meta.client) return

    try {
      const echo = useNuxtApp().$echo
      if (!echo) {
        console.warn('[SystemLogs] Echo not available')
        return
      }

      // Private logs channel
      logsChannel = echo.private('logs')
      logsChannel.listen('.log.created', (event: any) => {
        if (event.log) {
          // Prepend new log at the top
          state.logs.unshift(event.log)
          // Keep array manageable (max 200 in-memory)
          if (state.logs.length > 200) {
            state.logs.pop()
          }
          state.pagination.total += 1
          
          // Update metrics in real-time
          updateMetricsForNewLog(event.log)
        }
      })

      state.isStreamActive = true
      console.log('[SystemLogs] Stream connected')
    } catch (e) {
      console.error('[SystemLogs] Failed to connect stream:', e)
    }
  }

  const disconnectStream = () => {
    try {
      const echo = useNuxtApp().$echo
      if (echo && logsChannel) {
        echo.leave('logs')
        logsChannel = null
      }
      state.isStreamActive = false
      console.log('[SystemLogs] Stream disconnected')
    } catch (e) {
      console.error('[SystemLogs] Failed to disconnect stream:', e)
    }
  }


  // ---- Export ----

  const exportExcel = async () => {
    try {
      const blob = await api.systemLogs.exportExcel(state.filters)
      downloadBlob(blob, `system-logs-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (e) {
      console.error('[SystemLogs] Export Excel failed:', e)
    }
  }

  const exportPdf = async () => {
    try {
      const blob = await api.systemLogs.exportPdf(state.filters)
      downloadBlob(blob, `system-logs-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (e) {
      console.error('[SystemLogs] Export PDF failed:', e)
    }
  }

  const downloadBlob = (blob: any, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  // ---- Role check ----

  const getUserRole = (): string => {
    const u = user.value as any
    if (!u) return 'guest'
    const roles = u.roles ?? []
    if (roles.some((r: any) => r.name === 'Super Admin')) return 'Super Admin'
    if (roles.some((r: any) => r.name === 'IT Admin')) return 'IT Admin'
    if (roles.some((r: any) => r.name === 'Admin')) return 'Admin'
    return roles[0]?.name ?? 'user'
  }

  const isDeveloperRole = computed(() => {
    const role = getUserRole()
    return ['Super Admin', 'IT Admin', 'Admin'].includes(role)
  })

  return {
    state,
    fetchLogs,
    fetchMetrics,
    fetchLogDetail,
    setFilters,
    clearFilters,
    connectStream,
    disconnectStream,
    exportExcel,
    exportPdf,
    isDeveloperRole,
  }
}
