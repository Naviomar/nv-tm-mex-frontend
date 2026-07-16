import type { IMailLog, IMailLogMetrics } from '~/repository/modules/mailLogs'

interface MailLogsState {
  logs: IMailLog[]
  metrics: IMailLogMetrics | null
  isLoading: boolean
  pagination: {
    currentPage: number
    lastPage: number
    total: number
    perPage: number
  }
  filters: Record<string, string>
}

export function useMailLogs() {
  const api = useApiFactory()

  const state = reactive<MailLogsState>({
    logs: [],
    metrics: null,
    isLoading: false,
    pagination: {
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 25,
    },
    filters: {},
  })

  const fetchLogs = async (page = 1) => {
    state.isLoading = true
    try {
      const params: Record<string, string> = {
        ...state.filters,
        page: String(page),
        per_page: String(state.pagination.perPage),
      }
      Object.keys(params).forEach((k) => {
        if (!params[k]) delete params[k]
      })

      const res = await api.mailLogs.index(params)
      state.logs = res.data ?? []
      state.pagination = {
        currentPage: res.current_page ?? 1,
        lastPage: res.last_page ?? 1,
        total: res.total ?? 0,
        perPage: res.per_page ?? 25,
      }
    } catch (e) {
      console.error('[MailLogs] Failed to fetch logs:', e)
    } finally {
      state.isLoading = false
    }
  }

  const fetchMetrics = async () => {
    try {
      const res = await api.mailLogs.metrics()
      state.metrics = res.data ?? null
    } catch (e) {
      console.error('[MailLogs] Failed to fetch metrics:', e)
    }
  }

  const fetchLogDetail = async (id: number) => {
    try {
      const res = await api.mailLogs.show(id)
      return res.data ?? null
    } catch (e) {
      console.error('[MailLogs] Failed to fetch log detail:', e)
      return null
    }
  }

  const setFilters = (filters: Record<string, string>) => {
    state.filters = { ...filters }
    fetchLogs(1)
  }

  const clearFilters = () => {
    state.filters = {}
    fetchLogs(1)
  }

  const exportExcel = async () => {
    try {
      const blob = await api.mailLogs.exportExcel(state.filters)
      downloadBlob(blob, `mail-logs-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (e) {
      console.error('[MailLogs] Export Excel failed:', e)
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

  return {
    state,
    fetchLogs,
    fetchMetrics,
    fetchLogDetail,
    setFilters,
    clearFilters,
    exportExcel,
  }
}
