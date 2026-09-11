import type { IAdminAlert } from '~/repository/modules/alerts'

interface AlertsLogState {
  logs: IAdminAlert[]
  isLoading: boolean
  pagination: {
    currentPage: number
    lastPage: number
    total: number
    perPage: number
  }
  filters: Record<string, string>
}

export function useAlertsLog() {
  const api = useApiFactory()

  const state = reactive<AlertsLogState>({
    logs: [],
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

      const res = await api.alerts.getAdminAlerts(params)
      state.logs = res.data ?? []
      state.pagination = {
        currentPage: res.current_page ?? 1,
        lastPage: res.last_page ?? 1,
        total: res.total ?? 0,
        perPage: res.per_page ?? 25,
      }
    } catch (e) {
      console.error('[AlertsLog] Failed to fetch alerts:', e)
    } finally {
      state.isLoading = false
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

  return {
    state,
    fetchLogs,
    setFilters,
    clearFilters,
  }
}
